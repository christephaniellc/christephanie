import type { Theme } from '@mui/material';

function getPageHeight(theme: Theme) {
  const bottomSpacing = Number(theme.mixins.toolbar.minHeight) + parseInt(theme.spacing(1)) + 50;

  return `calc(100vh - ${bottomSpacing}px)`;
}

export { getPageHeight };
