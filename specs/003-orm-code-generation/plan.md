# Technical Architecture Plan: One-Click ORM & API Code Generator

**Feature ID**: `003-orm-code-generation`  
**Status**: `Implemented`  
**Spec Reference**: `spec.md`  

---

## 1. Architectural Strategy & SOLID Alignment

- **Open/Closed Principle (OCP)**: Uses the **Strategy Pattern** via `CodeGeneratorStrategy`. Adding new targets (e.g. Drizzle, GORM, Django) requires only adding a new strategy class without touching existing ones.
- **Single Responsibility (SRP)**:
  - `type-inference.ts`: Infer data types from actual sample values.
  - `strategies/`: Dedicated generator class per target.
  - `code-generator-modal/`: Presentation modal and clipboard handling.

---

## 2. Component & Strategy Layout

```text
app/features/code-generator/
├── domain/
│   ├── generator-strategy.ts
│   └── type-inference.ts
└── strategies/
    ├── efcore.strategy.ts
    ├── express.strategy.ts
    ├── index.ts
    ├── prisma.strategy.ts
    ├── sqlalchemy.strategy.ts
    └── typeorm.strategy.ts

app/components/
└── code-generator-modal/
    ├── index.tsx
    └── styles.ts
```

---

## 3. Strategy Interface Contract

```typescript
export interface CodeGeneratorStrategy {
  readonly target: CodeTarget
  readonly name: string
  readonly language: 'typescript' | 'csharp' | 'python'
  readonly extension: string
  readonly description: string

  generate(context: GenerationContext): string
}
```

