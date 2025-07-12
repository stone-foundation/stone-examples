import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { normalizePhone } from '../utils'
import { SessionService } from './SessionService'
import { BadCredentialsError } from '../errors/CredentialsError'
import { UserActivationEvent } from '../events/UserActivationEvent'
import { IUserRepository } from '../repositories/contracts/IUserRepository'
import { EventEmitter, IBlueprint, isEmpty, isNotEmpty, Logger, Service } from '@stone-js/core'
import { BadRequestError, IncomingHttpEvent, UnauthorizedError } from '@stone-js/http-core'
import { UserCredentials, UserToken, UserChangePassword, UserModel, UserTokenPayload, User, UserActivation, UserActivationRequest, UserRegister } from '../models/User'

/**
 * Security Service Options
*/
export interface SecurityServiceOptions {
  blueprint: IBlueprint
  eventEmitter: EventEmitter
  sessionService: SessionService
  userRepository: IUserRepository
}

/**
 * Security Service
*/
@Service({ alias: 'securityService' })
export class SecurityService {
  private readonly blueprint: IBlueprint
  private readonly eventEmitter: EventEmitter
  private readonly sessionService: SessionService
  private readonly userRepository: IUserRepository

  /**
   * Create a new Security Service
  */
  constructor ({ blueprint, eventEmitter, userRepository, sessionService }: SecurityServiceOptions) {
    this.blueprint = blueprint
    this.eventEmitter = eventEmitter
    this.userRepository = userRepository
    this.sessionService = sessionService
  }

  /**
   * Create an admin user
   *
   * @returns The UUID of the created admin user or undefined if creation failed
   */
  async createAdminUser (): Promise<string | undefined> {
    const adminUser = this.blueprint.get<UserModel>('app.security.admin', {} as unknown as UserModel)
    adminUser.phone = normalizePhone(adminUser.phone, true)
    const existingAdmin = await this.userRepository.findBy({ phone: adminUser.phone })

    if (isNotEmpty<UserModel>(existingAdmin)) {
      throw new BadCredentialsError(`The user with phone ${String(adminUser.phone)} already exists`)
    }

    if (isNotEmpty<UserModel>(adminUser)) {
      adminUser.isActive = true
      adminUser.isOnline = false
      adminUser.uuid = randomUUID()
      adminUser.createdAt = Date.now()
      adminUser.updatedAt = Date.now()
      adminUser.password = await this.hashPassword(adminUser.password ?? '')

      return await this.userRepository.create(adminUser)
    }
  }

  /**
   * Request user activation
   *
   * @param request - The user to request activation
   * @returns The user activation data
  */
  async requestActivation (request: UserActivationRequest): Promise<Partial<UserActivation>> {
    request.phone = normalizePhone(request.phone)
    const userModel = await this.userRepository.findBy({ phone: request.phone })
    const otpCount = userModel?.otpCount ?? 0

    if (isEmpty(userModel)) {
      throw new BadRequestError(`The user with phone ${request.phone} does not exist`)
    }

    const isActive = userModel.isActive && isNotEmpty(userModel.password)

    if (userModel.isActive) {
      return { isActive }
    }

    if (otpCount >= this.blueprint.get<number>('app.security.otp.maxCount', 5)) {
      throw new BadRequestError(`The user with phone ${request.phone} has reached the maximum number of OTP requests`)
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiresAt = Date.now() + this.blueprint.get<number>('app.security.otp.expiresIn', 300000) // 5 minutes

    await this.userRepository.update(userModel, { otp, otpCount: otpCount + 1, otpExpiresAt })

    const user: UserActivation = {
      otp,
      uuid: userModel.uuid,
      phone: userModel.phone,
      username: userModel.username,
      isActive: userModel.isActive
    }

    await this.eventEmitter.emit(new UserActivationEvent(user))

    return { isActive }
  }

  /**
   * Login a user
   *
   * @param credentials - The user to login
   * @returns The user token
  */
  async login (event: IncomingHttpEvent, credentials: UserCredentials): Promise<UserToken> {
    credentials.phone = normalizePhone(credentials.phone)
    const model = await this.userRepository.findBy({ phone: credentials.phone })
    const userModel = await this.validateUser(model, credentials)

    return {
      tokenType: 'bearer',
      expiresIn: this.blueprint.get<number>('app.security.jwt.expiresIn', 3600),
      accessToken: await this.generateToken(userModel, event.ip, event.userAgent)
    }
  }

  /**
   * Refresh a token
   *
   * @param token - The token to refresh
  */
  async refresh (token: string): Promise<UserToken> {
    const payload = this.verifyToken(token, true)
    const user = await this.userRepository.findByUuid(payload.user.uuid)

    if (isEmpty(user)) {
      throw new UnauthorizedError('User not found')
    }

    return {
      tokenType: 'bearer',
      expiresIn: this.blueprint.get<number>('app.security.jwt.expiresIn', 3600),
      accessToken: await this.generateToken(user, payload.session.ip, payload.session.userAgent ?? undefined)
    }
  }

  /**
   * Logout a user
   *
   * @param token - The token to logout
  */
  async logout (token: string): Promise<void> {
    const payload = this.verifyToken(token)
    await this.sessionService.close(payload.session)
  }

  /**
   * Authenticate a user
   *
   * @param token - The token to authenticate
   * @returns The authenticated user
  */
  async authenticate (token: string, ip: string, userAgent?: string): Promise<UserModel> {
    const payload = this.verifyToken(token)
    const user = await this.userRepository.findByUuid(payload.user.uuid)

    if (payload.session.ip !== ip) {
      throw new UnauthorizedError('Invalid IP address')
    } else if (payload.session.userAgent !== userAgent) {
      throw new UnauthorizedError('Invalid user agent') // TODO: Check if this is needed
    } else if (isEmpty(user)) {
      throw new UnauthorizedError('User not found')
    }

    await this.sessionService.updateLastActivity(payload.session)

    return user
  }

  /**
   * Authenticate a user or return undefined if the user is not authenticated
   *
   * @param token - The token to authenticate
   * @param ip - The IP address of the user
   * @param userAgent - The user agent of the user
   * @returns The authenticated user or undefined if not authenticated
  */
  async authenticateOrNot (token: string, ip: string, userAgent?: string): Promise<UserModel | undefined> {
    try {
      return await this.authenticate(token, ip, userAgent)
    } catch (error) {
      Logger.error('SecurityService', 'authenticateOrNot', error)
      return undefined
    }
  }

  /**
   * Check if the user is an admin
   *
   * @param user - The user to check
   * @returns True if the user is an admin, false otherwise
   */
  isAdmin (user?: User): boolean {
    const admins = this.blueprint.get<Array<Record<'phone' | 'role', string>>>('app.security.admins', [])
    return user?.roles?.includes('admin') ?? admins.some(admin => normalizePhone(admin.phone) === normalizePhone(user?.phone) && admin.role === 'admin')
  }

  /**
   * Check if the user has a specific role
   *
   * @param user - The user to check
   * @param role - The role to check for
   * @returns True if the user has the role, false otherwise
   */
  hasRole (user?: User, role?: string): boolean {
    return user?.roles?.includes(role ?? '') || false
  }

  /**
   * Hashes a password before storing it in the database.
   *
   * @param password - The plaintext password.
   * @returns The hashed password.
   */
  async hashPassword (password: string): Promise<string> {
    return await bcrypt.hash(password, this.blueprint.get<number>('app.security.bcrypt.saltRounds', 10))
  }

  /**
   * Compares a plaintext password with a hashed password.
   *
   * @param password - The plaintext password.
   * @param hashedPassword - The stored hashed password.
   * @returns `true` if the password matches, otherwise `false`.
   */
  async comparePassword (password: string, hashedPassword?: string | null): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword ?? '')
  }

  /**
   * Generates a JWT token for a user.
   *
   * @param user - The user information to include in the token.
   * @returns The generated JWT token.
   */
  async generateToken (userModel: UserModel, ip: string, userAgent?: string): Promise<string> {
    const user: User = { ...userModel, password: undefined, otp: undefined, otpExpiresAt: undefined, otpCount: undefined }

    let session = await this.sessionService.getLatest(user)
    const jwtOptions = this.blueprint.get<jwt.SignOptions>('app.security.jwt', {})
    const expiresIn = Number(jwtOptions.expiresIn ?? 3600)

    if (
      isEmpty(session) ||
      session?.ip !== ip ||
      isNotEmpty(session.closedAt) ||
      session?.userAgent !== userAgent
    ) {
      session = await this.sessionService.createForUser(user, ip, userAgent)
    } else {
      session = await this.sessionService.extend(
        session,
        expiresIn
      )
    }

    return jwt.sign(
      { user, session },
      this.blueprint.get<string>('app.security.secret', 'secret'),
      { ...jwtOptions, expiresIn: expiresIn * 1000 }
    )
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   *
   * @param token - The JWT token to verify.
   * @returns The decoded user payload or null if invalid.
   */
  verifyToken = (token: string, ignoreExpiration: boolean = false): UserTokenPayload => {
    try {
      return jwt.verify(
        token,
        this.blueprint.get<string>('app.security.secret', 'secret'),
        { ignoreExpiration }
      ) as UserTokenPayload
    } catch (error: any) {
      throw new UnauthorizedError('Invalid token', { cause: error })
    }
  }

  /**
   * Register a user
   *
   * @param user - The user to register
  */
  async register (payload: UserRegister): Promise<void> {
    const canRegister = this.blueprint.get<boolean>('app.security.allowRegister', false)

    if (!canRegister) {
      throw new BadRequestError('User registration is not allowed')
    }

    payload.phone = normalizePhone(payload.phone, true)

    const user = await this.userRepository.findBy({ phone: payload.phone })
    const user2 = await this.userRepository.findBy({ username: payload.username })

    if (isNotEmpty(user)) {
      throw new BadRequestError(`The user with phone (${payload.phone}) already exists`)
    }

    if (isNotEmpty(user2)) {
      throw new BadRequestError(`The user with username (${payload.username}) already exists`)
    }

    const password = await this.hashPassword(payload.password)

    await this.userRepository.create({
      password,
      isActive: true,
      isOnline: false,
      uuid: randomUUID(),
      phone: payload.phone,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      fullname: payload.fullname,
      username: payload.username
    })
  }

  /**
   * Change the user password
   *
   * @param user - The user to change the password
   * @param userPassword - The password to change
  */
  async changePassword (user: User, userPassword: UserChangePassword): Promise<void> {
    const credentials = { ...userPassword, phone: user.phone }
    const userModel = await this.validateUser(user, credentials)
    const password = await this.hashPassword(userPassword.newPassword)

    await this.userRepository.update(userModel, { password, isActive: true })
  }

  /**
   * Validates the user credentials.
   *
   * @param userModel - The user model to validate
   * @param credentials - The user credentials to validate
   * @return The validated user model
   * @throws BadCredentialsError if the credentials are invalid
  */
  private async validateUser (userModel: UserModel | undefined, credentials: UserCredentials): Promise<UserModel> {
    if (isEmpty(userModel)) {
      throw new BadCredentialsError(`The user with phone ${credentials.phone} does not exist`)
    }

    // Check if the user is active when user password is set
    if (isNotEmpty(userModel.password) && !userModel.isActive) {
      throw new BadCredentialsError(`The user with phone ${credentials.phone} is not active`)
    }

    if (isEmpty(userModel.password) && isEmpty(userModel.otp)) {
      throw new BadCredentialsError(`The user with phone ${credentials.phone} does not have a credentials`)
    }

    if (isNotEmpty(credentials.otp)) {
      if (userModel.otp !== credentials.otp) {
        throw new BadCredentialsError(`The user with phone ${credentials.phone} has an invalid OTP`)
      } else if (Date.now() > (userModel.otpExpiresAt ?? 0)) {
        throw new BadCredentialsError(`The user with phone ${credentials.phone} has an expired OTP`)
      }
    } else if (!(await this.comparePassword(credentials.password ?? '', userModel.password))) {
      throw new BadCredentialsError(`The user with phone ${credentials.phone} has an invalid password`)
    }

    return userModel
  }
}
