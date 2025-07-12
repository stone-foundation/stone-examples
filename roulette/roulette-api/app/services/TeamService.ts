import { User } from '../models/User'
import { randomUUID } from 'node:crypto'
import { NotFoundError } from '@stone-js/http-core'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Team, TeamMember, TeamModel } from '../models/Team'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { IBlueprint, IContainer, isNotEmpty, Service } from '@stone-js/core'
import { ITeamRepository } from '../repositories/contracts/ITeamRepository'

/**
 * Team Service Options
*/
export interface TeamServiceOptions {
  s3Client: S3Client
  blueprint: IBlueprint
  teamRepository: ITeamRepository
}

/**
 * Team Service
*/
@Service({ alias: 'teamService' })
export class TeamService {
  private readonly s3Client: S3Client
  private readonly blueprint: IBlueprint
  private readonly teamRepository: ITeamRepository

  /**
   * Resolve route binding
   *
   * @param key - The key of the binding
   * @param value - The value of the binding
   * @param container - The container
   */
  static async resolveRouteBinding (key: string, value: any, container: IContainer): Promise<Team | undefined> {
    const teamService = container.resolve<TeamService>('teamService')
    return await teamService.findBy({ [key]: value })
  }

  /**
   * Create a new Team Service
  */
  constructor ({ s3Client, blueprint, teamRepository }: TeamServiceOptions) {
    this.s3Client = s3Client
    this.blueprint = blueprint
    this.teamRepository = teamRepository
  }

  /**
   * List teams
   *
   * @param limit - The limit of teams to list
   */
  async list (limit: number = 10): Promise<Team[]> {
    return (await this.teamRepository.list(limit)).map(v => this.toTeam(v))
  }

  /**
   * Find a team
   *
   * @param conditions - The conditions to find the team
   * @returns The found team
   */
  async findBy (conditions: Record<string, any>): Promise<Team> {
    const teamModel = await this.teamRepository.findBy(conditions)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
    throw new NotFoundError(`The team with conditions ${JSON.stringify(conditions)} not found`)
  }

  /**
   * Find a team by uuid
   *
   * @param uuid - The uuid of the team to find
   * @returns The found team or undefined if not found
   */
  async findByUuid (uuid: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findByUuid(uuid)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Find a team by name
   *
   * @param name - The name of the team to find
   * @returns The found team or undefined if not found
   */
  async findByName (name: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findBy({ name })
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Find a team by color
   *
   * @param color - The color of the team to find
   * @returns The found team or undefined if not found
   */
  async findByColor (color: string): Promise<Team | undefined> {
    const teamModel = await this.teamRepository.findBy({ color })
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
  }

  /**
   * Create a team
   *
   * @param team - The team to create
   */
  async create (team: Team): Promise<string | undefined> {
    const totalMember = this.blueprint.get<number>('app.team.defaultTotalMember', team.totalMember ?? 10)

    return await this.teamRepository.create({
      ...team,
      totalMember,
      countMember: 0,
      uuid: randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }

  /**
   * Update a team
   *
   * @param team - The team to update
   * @param data - The data to update in the team
   * @returns The updated team
   */
  async update (team: Team, data: Partial<Team>): Promise<Team> {
    const teamModel = await this.teamRepository.update(team, data)
    if (isNotEmpty<TeamModel>(teamModel)) return this.toTeam(teamModel)
    throw new NotFoundError(`Team with ID ${team.uuid} not found`)
  }

  /**
   * Delete a team
   *
   * @param team - The team to delete
   */
  async delete (team: Team): Promise<boolean> {
    return await this.teamRepository.delete(team)
  }

  /**
   * Generate upload URLs for team logo or banner
   *
   * @param team - The team for which to generate the upload URLs
   * @param type - The type of the image (logo or banner)
   * @param extension - The file extension of the image (default is 'png')
   * @returns An object containing the upload URL, public URL, and key
   */
  async generateUploadUrls (team: Team, type: 'logo' | 'banner', extension: string = 'png'): Promise<{ uploadUrl: string, publicUrl: string, key: string }> {
    const bucketName = this.blueprint.get<string>('aws.s3.bucketName', 'teams')
    const expiresIn = this.blueprint.get<number>('aws.s3.signedUrlExpireSeconds', 300)
    const s3BucketFolder = this.blueprint.get<string>('aws.s3.teamsFolderName', 'teams')
    const cloudfrontStaticUrl = this.blueprint.get<string>('aws.cloudfront.distStaticName', 'static')
    const key = `${s3BucketFolder}/${team.uuid}/${type}.${extension}`

    const command = new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      ContentType: `image/${extension}`
    })

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn })

    const publicUrl = `${cloudfrontStaticUrl}/${key}`

    if (type === 'logo') {
      await this.update(team, { logoUrl: publicUrl, updatedAt: Date.now() })
    } else if (type === 'banner') {
      await this.update(team, { bannerUrl: publicUrl, updatedAt: Date.now() })
    }

    return { uploadUrl, publicUrl, key }
  }

  /**
   * Convert TeamModel to Team
   *
   * @param teamModel - The team model to convert
   * @returns The converted team
   */
  toTeam (teamModel: TeamModel, members: User[] = []): Team {
    return { ...teamModel, members }
  }

  /**
   * Convert Team to Partial<Team>
   *
   * @param team - The team to convert
   * @param withDetails - Whether to include detailed information like members and chat link
   * @returns The converted team
   */
  toStatTeam (team: Team, withDetails: boolean = false): Partial<Team> {
    return {
      name: team.name,
      color: team.color,
      totalMember: team.totalMember,
      countMember: team.countMember,
      members: withDetails ? team.members : undefined,
      chatLink: withDetails ? team.chatLink : undefined
    }
  }

  toTeamMember (member: User): TeamMember {
    const isCaptain = member.roles?.includes('captain') || false

    return {
      isCaptain,
      uuid: member.uuid,
      phone: member.phone,
      isSoldier: !isCaptain,
      fullname: member.fullname,
      username: member.username,
      isPresent: isNotEmpty(member.presenceActivityUuid)
    }
  }
}
