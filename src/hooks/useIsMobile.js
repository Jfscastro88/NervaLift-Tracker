import { useMediaQuery } from '@mantine/hooks';

export function useIsMobile(breakpoint = '(max-width: 48em)') {
  return useMediaQuery(breakpoint);
}

export function useIsSmallScreen(breakpoint = '(max-width: 36em)') {
  return useMediaQuery(breakpoint);
}
