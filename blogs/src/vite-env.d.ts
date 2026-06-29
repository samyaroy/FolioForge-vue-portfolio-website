/// <reference types="vite/client" />

declare module '*.yml' {
  const data: Record<string, string>
  export default data
}
