# TypeMapper

TypeMapper is a modern web application that automatically converts JavaScript objects to their TypeScript type definitions. Simply paste or type a JavaScript object in the left panel, and see the inferred TypeScript types in the right panel.

![TypeMapper screenshot](https://via.placeholder.com/800x400.png?text=TypeMapper+Screenshot)

## Features

- ✅ Automatic type inference from JavaScript objects
- 🎨 Modern, responsive interface with animations
- 🌓 Dark and light mode support
- ⚡ Real-time type conversion
- 📋 Copy to clipboard functionality
- 🛠️ Support for various JavaScript types:
  - Primitive types (string, number, boolean)
  - Complex types (arrays, objects)
  - Special types (Date, null, undefined)

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) - Syntax highlighting
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 16.8+ and npm/yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/typemapper.git
cd typemapper
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. Paste or type a JavaScript object in the left panel
2. The TypeScript type definition will automatically appear in the right panel
3. Use the theme toggle to switch between dark and light mode
4. Click the copy button to copy the type definition to your clipboard

## Examples

Input:
```javascript
{
  nome: "Will",
  idade: 23,
  ativo: true,
  nascimento: new Date("1990-05-10")
}
```

Output:
```typescript
{
  nome: string;
  idade: number;
  ativo: boolean;
  nascimento: Date;
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
