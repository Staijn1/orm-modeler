export type Fact = {
  EntityType: EntityType
  Readings: Reading[]
  Target: EntityType | ValueType
}

export type EntityType = {
  Name: string
  Identifier: Identifier
}

export type Identifier = {
  Name: string
  Datatype: Datatype | undefined
}

export type Datatype = 'number'

export type Reading = string

export type ValueType = {
  Name: string
  Datatype: Datatype | undefined
}

