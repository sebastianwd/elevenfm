import { Field, ObjectType } from 'type-graphql'

@ObjectType('artist')
export class Artist {
  @Field()
  name: string

  @Field({ nullable: true })
  image?: string

  @Field({ nullable: true })
  formedYear?: string

  @Field({ nullable: true })
  bannerImage?: string

  @Field({ nullable: true })
  logo?: string

  @Field({ nullable: true })
  style?: string

  @Field({ nullable: true })
  genre?: string

  @Field({ nullable: true })
  website?: string

  @Field({ nullable: true })
  facebook?: string

  @Field({ nullable: true })
  twitter?: string

  @Field({ nullable: true })
  biography?: string

  @Field({ nullable: true })
  memberQuantity?: number

  @Field({ nullable: true })
  location?: string

  @Field({ nullable: true })
  disbanded?: boolean

  @Field({ nullable: true })
  disbandedYear?: string
}

export default Artist
