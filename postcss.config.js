import postcssGlobalData from '@csstools/postcss-global-data';
import postcssCustomMedia from 'postcss-custom-media';

// Breakpoints live in src/styles/tokens.css as @custom-media and are made
// visible to every CSS Module through postcss-global-data.
export default {
  plugins: [
    postcssGlobalData({ files: ['src/styles/tokens.css'] }),
    postcssCustomMedia(),
  ],
};
