export type CodeTarget = 'prisma' | 'typeorm' | 'drizzle' | 'sqlalchemy' | 'efcore' | 'nextjs_api'

export interface TargetMetadata {
  id: CodeTarget
  name: string
  lang: string
  ext: string
  badge: string
  color: string
}

export const TARGET_CATALOG: readonly TargetMetadata[] = [
  { id: 'prisma', name: 'Prisma ORM', lang: 'typescript', ext: 'ts', badge: 'Node.js', color: '#16a34a' },
  { id: 'drizzle', name: 'Drizzle ORM', lang: 'typescript', ext: 'ts', badge: 'Node.js', color: '#06b6d4' },
  { id: 'typeorm', name: 'TypeORM', lang: 'typescript', ext: 'ts', badge: 'Node.js', color: '#e11d48' },
  { id: 'sqlalchemy', name: 'SQLAlchemy', lang: 'python', ext: 'py', badge: 'Python', color: '#3b82f6' },
  { id: 'efcore', name: 'EF Core', lang: 'csharp', ext: 'cs', badge: 'C# / .NET', color: '#8b5cf6' },
  { id: 'nextjs_api', name: 'API REST / Route', lang: 'typescript', ext: 'ts', badge: 'Next.js', color: '#f59e0b' },
] as const

