// FUTURE CUSTOMER DASHBOARD
// Keep this as a separate product surface. Do not expose employee/admin
// statistics here. The customer flow will later use customer authentication
// and dedicated ordering APIs.

import React from "react";
import {View,Text,StyleSheet,TouchableOpacity} from "react-native";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

const CustomerDashboard = ({navigation}) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.brand}>GO GAS</Text>
      <FontAwesome6 name="bell" size={19} color="#252B35"/>
    </View>

    <Text style={styles.greeting}>Hello 👋</Text>
    <Text style={styles.subtitle}>What would you like to do today?</Text>

    <TouchableOpacity style={styles.orderCard} onPress={()=>navigation.navigate("CustomerOrderCylinder")}>
      <View>
        <Text style={styles.orderTitle}>Order Gas Cylinder</Text>
        <Text style={styles.orderText}>Get your cylinder delivered to your home</Text>
        <View style={styles.orderButton}><Text style={styles.orderButtonText}>Order Now</Text><FontAwesome6 name="arrow-right" size={11} color="#5B21B6"/></View>
      </View>
      <FontAwesome6 name="gas-pump" size={45} color="#8B5CF6"/>
    </TouchableOpacity>

    <Text style={styles.section}>QUICK ACTIONS</Text>
    <View style={styles.grid}>
      <Action icon="gas-pump" title="Order Cylinder"/>
      <Action icon="receipt" title="My Orders"/>
      <Action icon="credit-card" title="Payments"/>
      <Action icon="user" title="My Profile"/>
    </View>

    <Text style={styles.section}>CURRENT ORDER</Text>
    <View style={styles.currentCard}>
      <Text style={styles.orderNo}>#GO28456</Text>
      <Text style={styles.cylinder}>14.2 KG Cylinder</Text>
      <View style={styles.status}><Text style={styles.statusText}>Out for Delivery</Text></View>
      <Text style={styles.expected}>Expected Today</Text>
    </View>
  </View>
);

const Action=({icon,title})=>(
  <TouchableOpacity style={styles.action}>
    <View style={styles.actionIcon}><FontAwesome6 name={icon} size={18} color="#7C3AED"/></View>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:"#F6F9FD",padding:16},
  header:{height:48,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  brand:{fontSize:19,fontWeight:"900",color:"#168A4A"},
  greeting:{fontSize:22,fontWeight:"800",color:"#252B35",marginTop:15},
  subtitle:{fontSize:12,color:"#7A8493",marginTop:3},
  orderCard:{marginTop:18,borderRadius:18,padding:18,backgroundColor:"#8B5CF6",flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  orderTitle:{fontSize:16,fontWeight:"800",color:"#fff"},
  orderText:{fontSize:10,color:"#EDE9FE",marginTop:4,width:180,lineHeight:15},
  orderButton:{marginTop:12,backgroundColor:"#fff",borderRadius:20,paddingHorizontal:13,paddingVertical:8,alignSelf:"flex-start",flexDirection:"row",gap:6},
  orderButtonText:{fontSize:10,fontWeight:"800",color:"#5B21B6"},
  section:{fontSize:12,fontWeight:"800",color:"#252B35",marginTop:22,marginBottom:10},
  grid:{flexDirection:"row",justifyContent:"space-between"},
  action:{width:"23%",backgroundColor:"#fff",borderWidth:1,borderColor:"#E7EDF4",borderRadius:13,paddingVertical:12,alignItems:"center"},
  actionIcon:{width:35,height:35,borderRadius:10,backgroundColor:"#F3EEFF",alignItems:"center",justifyContent:"center"},
  actionText:{fontSize:9,fontWeight:"700",color:"#252B35",textAlign:"center",marginTop:6},
  currentCard:{backgroundColor:"#fff",borderWidth:1,borderColor:"#E7EDF4",borderRadius:16,padding:15},
  orderNo:{fontSize:11,fontWeight:"800",color:"#252B35"},
  cylinder:{fontSize:12,color:"#7A8493",marginTop:3},
  status:{alignSelf:"flex-start",backgroundColor:"#F3EEFF",borderRadius:20,paddingHorizontal:10,paddingVertical:5,marginTop:10},
  statusText:{fontSize:9,color:"#5B21B6",fontWeight:"800"},
  expected:{fontSize:9,color:"#7A8493",marginTop:7},
});

export default CustomerDashboard;
