interface locale {
  projects: {
    title: string
  }
}

declare module "./locales/*.yaml" {
  const data: locale
  export default data
}
