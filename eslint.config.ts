import antfu from '@antfu/eslint-config'

export default antfu({}, {
  files: ['src/__test__/**/*'],
  rules: {
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-argument': 'off',
    'ts/no-unsafe-return': 'off',
  },
})
