import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

export const COLORS = {
  blue: "#4A90E2",
  blueLight: "#EAF3FF",
  green: "#168A4A",
  greenLight: "#EAF8EF",
  orange: "#F59E0B",
  orangeLight: "#FFF6E5",
  purple: "#7C3AED",
  purpleLight: "#F3EEFF",
  red: "#EF4444",
  redLight: "#FEECEC",
  text: "#252B35",
  muted: "#7A8493",
  border: "#E7EDF4",
  bg: "#F6F9FD",
  white: "#FFFFFF",
};

export const StatCard = ({icon, title, value, subtitle, color=COLORS.blue, bg=COLORS.blueLight}) => (
  <View style={styles.statCard}>
    <View style={[styles.iconBox,{backgroundColor:bg}]}>
      <FontAwesome6 name={icon} size={17} color={color}/>
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
    {!!subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

export const SectionTitle = ({title, action, onPress}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && <TouchableOpacity onPress={onPress}><Text style={styles.action}>{action}</Text></TouchableOpacity>}
  </View>
);

export const QuickAction = ({icon,title,onPress,color=COLORS.blue,bg=COLORS.blueLight}) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickIcon,{backgroundColor:bg}]}>
      <FontAwesome6 name={icon} size={17} color={color}/>
    </View>
    <Text style={styles.quickText}>{title}</Text>
  </TouchableOpacity>
);

export const InfoRow = ({icon,title,subtitle,value,color=COLORS.blue}) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIcon,{backgroundColor:`${color}15`}]}>
      <FontAwesome6 name={icon} size={13} color={color}/>
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.infoSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export const Card = ({children, style}) => <View style={[styles.card,style]}>{children}</View>;

export const StatusCard = ({icon,title,status,subtitle,color=COLORS.orange,onPress}) => (
  <TouchableOpacity style={styles.statusCard} onPress={onPress} activeOpacity={0.82}>
    <View style={[styles.statusIcon,{backgroundColor:`${color}15`}]}>
      <FontAwesome6 name={icon} size={20} color={color}/>
    </View>
    <View style={styles.statusBody}>
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={[styles.statusValue,{color}]}>{status}</Text>
      {!!subtitle && <Text style={styles.statusSubtitle}>{subtitle}</Text>}
    </View>
    <FontAwesome6 name="chevron-right" size={12} color="#AAB4C0"/>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card:{backgroundColor:COLORS.white,borderRadius:16,borderWidth:1,borderColor:COLORS.border,padding:15,marginBottom:16},
  statCard:{width:"48%",backgroundColor:COLORS.white,borderRadius:16,borderWidth:1,borderColor:COLORS.border,padding:13,minHeight:125,marginBottom:10},
  iconBox:{width:38,height:38,borderRadius:11,alignItems:"center",justifyContent:"center",marginBottom:9},
  statTitle:{fontSize:10,color:COLORS.muted,fontWeight:"500"},
  statValue:{fontSize:22,color:COLORS.text,fontWeight:"800",marginTop:2},
  statSubtitle:{fontSize:9,color:COLORS.muted,marginTop:3},
  sectionHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10},
  sectionTitle:{fontSize:13,color:COLORS.text,fontWeight:"800",letterSpacing:.3},
  action:{fontSize:11,color:COLORS.blue,fontWeight:"700"},
  quickAction:{width:"48%",minHeight:92,backgroundColor:COLORS.white,borderRadius:15,borderWidth:1,borderColor:COLORS.border,alignItems:"center",justifyContent:"center",marginBottom:10},
  quickIcon:{width:40,height:40,borderRadius:12,alignItems:"center",justifyContent:"center",marginBottom:7},
  quickText:{fontSize:11,color:COLORS.text,fontWeight:"700",textAlign:"center"},
  infoRow:{flexDirection:"row",alignItems:"center",paddingVertical:11,borderBottomWidth:1,borderBottomColor:"#F0F3F6"},
  infoIcon:{width:34,height:34,borderRadius:10,alignItems:"center",justifyContent:"center",marginRight:10},
  infoBody:{flex:1},
  infoTitle:{fontSize:11,color:COLORS.text,fontWeight:"700"},
  infoSubtitle:{fontSize:9,color:COLORS.muted,marginTop:2},
  infoValue:{fontSize:13,color:COLORS.text,fontWeight:"800"},
  statusCard:{backgroundColor:COLORS.white,borderRadius:16,borderWidth:1,borderColor:"#F7DDB2",padding:15,flexDirection:"row",alignItems:"center",marginBottom:18},
  statusIcon:{width:48,height:48,borderRadius:14,alignItems:"center",justifyContent:"center",marginRight:11},
  statusBody:{flex:1},
  statusTitle:{fontSize:10,color:COLORS.muted},
  statusValue:{fontSize:18,fontWeight:"800",marginTop:2},
  statusSubtitle:{fontSize:9,color:COLORS.muted,marginTop:2},
});
