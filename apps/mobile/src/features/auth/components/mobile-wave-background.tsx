import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

interface MobileWaveBackgroundProps {
  color?: string;
  opacity?: number;
}

export function MobileWaveBackground({ color = "#9F7AEA", opacity = 0.55 }: MobileWaveBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden={true}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ opacity }}
      >
        <Defs>
          <LinearGradient id="wave-lines-left-type1-grad" x1="0%" y1="0%" x2="100%" y2="80%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <Stop offset="45%" stopColor={color} stopOpacity="0.22" />
            <Stop offset="80%" stopColor={color} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="wave-lines-left-type2-grad" x1="0%" y1="100%" x2="100%" y2="20%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="85%" stopColor={color} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="wave-lines-right-type1-grad" x1="100%" y1="0%" x2="0%" y2="80%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <Stop offset="45%" stopColor={color} stopOpacity="0.22" />
            <Stop offset="80%" stopColor={color} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="wave-lines-right-type2-grad" x1="100%" y1="100%" x2="0%" y2="20%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.18" />
            <Stop offset="85%" stopColor={color} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* LEFT SIDE - Line Type 1: Solid layered sweeping curves */}
        <G stroke="url(#wave-lines-left-type1-grad)">
          <Path d="M -50,80 C 160,110 300,240 400,420 C 480,570 470,740 420,950" strokeWidth="1.6" />
          <Path d="M -50,130 C 180,160 320,290 430,460 C 510,610 500,770 460,950" strokeWidth="1.4" />
          <Path d="M -50,180 C 200,210 340,340 460,500 C 540,650 530,800 500,950" strokeWidth="1.2" />
          <Path d="M -50,230 C 220,260 360,390 490,540 C 570,690 560,830 540,950" strokeWidth="1.0" />
          <Path d="M -50,280 C 240,310 380,440 520,580 C 600,730 590,860 580,950" strokeWidth="0.8" />
        </G>

        {/* LEFT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <G stroke="url(#wave-lines-left-type2-grad)" strokeDasharray="8 6">
          <Path d="M -50,820 C 140,770 280,630 400,580 C 510,530 570,390 540,120" strokeWidth="1.4" />
          <Path d="M -50,770 C 160,720 300,580 430,530 C 540,480 600,340 580,150" strokeWidth="1.2" />
          <Path d="M -50,720 C 180,670 320,530 460,480 C 570,430 630,290 620,180" strokeWidth="1.0" />
          <Path d="M -50,670 C 200,620 340,480 490,430 C 600,380 660,240 660,210" strokeWidth="0.8" />
        </G>

        {/* RIGHT SIDE - Line Type 1: Solid layered sweeping curves */}
        <G stroke="url(#wave-lines-right-type1-grad)">
          <Path d="M 1490,80 C 1280,110 1140,240 1040,420 C 960,570 970,740 1020,950" strokeWidth="1.6" />
          <Path d="M 1490,130 C 1260,160 1120,290 1010,460 C 930,610 940,770 980,950" strokeWidth="1.4" />
          <Path d="M 1490,180 C 1240,210 1100,340 980,500 C 900,650 910,800 940,950" strokeWidth="1.2" />
          <Path d="M 1490,230 C 1220,260 1080,390 950,540 C 870,690 880,830 900,950" strokeWidth="1.0" />
          <Path d="M 1490,280 C 1200,310 1060,440 920,580 C 840,730 850,860 860,950" strokeWidth="0.8" />
        </G>

        {/* RIGHT SIDE - Line Type 2: Dashed layered undulating contour curves */}
        <G stroke="url(#wave-lines-right-type2-grad)" strokeDasharray="8 6">
          <Path d="M 1490,820 C 1300,770 1160,630 1040,580 C 930,530 870,390 900,120" strokeWidth="1.4" />
          <Path d="M 1490,770 C 1280,720 1140,580 1010,530 C 900,480 840,340 860,150" strokeWidth="1.2" />
          <Path d="M 1490,720 C 1260,670 1120,530 980,480 C 870,430 810,290 820,180" strokeWidth="1.0" />
          <Path d="M 1490,670 C 1240,620 1100,480 950,430 C 840,380 780,240 780,210" strokeWidth="0.8" />
        </G>
      </Svg>
    </View>
  );
}
