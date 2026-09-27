export const publishingTarget = {
  branch: 'V1',
  environment: 'Beta',
  portfolioOrigin: 'https://beta.samyabrata.codeium.xyz',
  blogOrigin: 'https://blogs.samyabrata.codeium.xyz',
} as const

export const publishingBranchLabel = `${publishingTarget.environment} / ${publishingTarget.branch}`
