import { Dimensions, Platform } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

export const isTablet = W >= 768;
export const isIPad = Platform.OS === 'ios' && W >= 768;

export const responsive = {
  width: W,
  height: H,
  isTablet,

  padding: isTablet ? 48 : 16,
  paddingLg: isTablet ? 64 : 24,

  fontSize: {
    xs:    isTablet ? 13  : 10,
    sm:    isTablet ? 15  : 12,
    md:    isTablet ? 17  : 14,
    lg:    isTablet ? 20  : 16,
    xl:    isTablet ? 24  : 20,
    xxl:   isTablet ? 32  : 26,
    title: isTablet ? 40  : 32,
    hero:  isTablet ? 52  : 42,
  },

  iconSize: {
    sm:  isTablet ? 28 : 20,
    md:  isTablet ? 36 : 24,
    lg:  isTablet ? 48 : 32,
  },

  mascotSize: {
    sm:  isTablet ? 100 : 60,
    md:  isTablet ? 140 : 90,
    lg:  isTablet ? 180 : 120,
    xl:  isTablet ? 220 : 160,
  },

  cardWidth: isTablet ? W * 0.5 : W - 32,
  maxWidth: isTablet ? 600 : W,

  columns: {
    stats:   isTablet ? 4 : 4,
    actions: isTablet ? 4 : 3,
    games:   isTablet ? 3 : 2,
    avatars: isTablet ? 6 : 4,
  },

  tabBarHeight: isTablet ? 80 : 62,
  tabBarIconSize: isTablet ? 28 : 22,
};
