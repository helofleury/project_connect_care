import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Card from "../components/Card";
import { useVehicle } from "../hooks/useVehicle";
import { useCustomerProfile } from "../hooks/useCustomerProfile";
import { useTheme } from "../contexts/ThemeContext";
import { DEMO_VIN } from "../constants/demo";
import type { AppStackParamList } from "../navigation/types";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<AppStackParamList>;

const PROFILE_DETAILS: Record<string, { frequency: string; price: string; engagement: string; hint: string }> = {
  urbano_leve: { frequency: "Moderada", price: "Alta", engagement: "Médio", hint: "Você usa seu Ford principalmente no dia a dia." },
  motorista_aplicativo: { frequency: "Muito alta", price: "Alta", engagement: "Alto", hint: "Seu Ford faz parte da sua rotina de trabalho." },
  usuario_offroad: { frequency: "Alta", price: "Média", engagement: "Alto", hint: "Seu uso indica viagens e terrenos mais exigentes." },
  premium_baixa_km: { frequency: "Baixa", price: "Baixa", engagement: "Alto", hint: "Você valoriza cuidado, conforto e experiência." },
  cliente_economico: { frequency: "Baixa", price: "Muito alta", engagement: "Médio", hint: "Economia e boas oportunidades fazem diferença para você." },
  profissional_autonomo: { frequency: "Alta", price: "Alta", engagement: "Alto", hint: "Seu Ford é importante para manter sua rotina rodando." },
};

export default function VehicleHealthScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { vehicle, loading: vehicleLoading, refreshVehicle } = useVehicle("app");
  const { profile, loading: profileLoading, refreshProfile } = useCustomerProfile(DEMO_VIN);
  const loading = vehicleLoading || profileLoading;
  const styles = createStyles(colors);
  const detail = PROFILE_DETAILS[profile?.key || "urbano_leve"];

  const refresh = async () => Promise.all([refreshVehicle(), refreshProfile()]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <View style={styles.header}><Text style={styles.title}>Meu Comportamento</Text><Pressable onPress={() => navigation.navigate("Profile")}><Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} /></Pressable></View>
        <Text style={styles.subtitle}>Conheça melhor seu perfil e receba uma experiência feita para você.</Text>

     

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}><Text style={styles.profileEmoji}>{profile?.icon || "🚗"}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.name || "Cliente Ford"}</Text>
            <Text style={styles.profileDescription}>{profile?.description || "Estamos entendendo como você usa seu Ford."}</Text>
          </View>
        </View>

        <Text style={styles.section}>CARACTERÍSTICAS DO SEU PERFIL</Text>
        <Card>
          <Metric icon="construct-outline" label="Frequência de serviço" value={detail.frequency} colors={colors} />
          <Metric icon="pricetag-outline" label="Sensibilidade a preço" value={detail.price} colors={colors} />
          <Metric icon="chatbubble-ellipses-outline" label="Uso do veículo" value={detail.engagement} colors={colors} last />
        </Card>

        <Text style={styles.section}>SEU FORD HOJE</Text>
        <Card style={styles.vehicleCard}>
          <View style={styles.carIcon}><Ionicons name="car-sport" size={52} color={colors.primary} /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.vehicleModel}>{vehicle?.model || "Seu Ford"}</Text>
            <Text style={styles.vehicleMeta}>{vehicle?.year || "Ano não informado"} • {(vehicle?.mileage || 0).toLocaleString("pt-BR")} km</Text>
            <Text style={styles.hint}>{detail.hint}</Text>
          </View>
        </Card>

        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>Personalização da experiência</Text>
          <Text style={styles.compareText}>Usamos seu perfil para escolher comunicações mais úteis — sem excesso de mensagens.</Text>
          <View style={styles.progress}><View style={[styles.progressFill, { width: "75%" }]} /></View>
          <Text style={styles.progressLabel}>75% da experiência personalizada</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value, colors, last }: any) {
  return <View style={[metricStyles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}><View style={metricStyles.left}><Ionicons name={icon} size={16} color={colors.textSecondary}/><Text style={[metricStyles.label,{color:colors.textSecondary}]}>{label}</Text></View><Text style={[metricStyles.value,{color:colors.text}]}>{value}</Text></View>;
}
const metricStyles=StyleSheet.create({row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12},left:{flexDirection:"row",alignItems:"center",gap:8,flex:1},label:{...typography.caption},value:{...typography.caption,fontWeight:"700"}});
function createStyles(colors:any){return StyleSheet.create({safe:{flex:1,backgroundColor:colors.background},content:{padding:14,paddingBottom:30},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},title:{...typography.title,color:colors.text,fontWeight:"800"},subtitle:{...typography.caption,color:colors.textSecondary,marginTop:3,marginBottom:10},tabs:{flexDirection:"row",backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:11,overflow:"hidden"},tab:{flex:1,paddingVertical:9,alignItems:"center"},tabActive:{borderBottomWidth:2,borderBottomColor:colors.primary},tabText:{...typography.caption,color:colors.textSecondary},tabActiveText:{...typography.caption,color:colors.primary,fontWeight:"800"},profileCard:{backgroundColor:colors.primaryLight,borderRadius:16,padding:14,marginTop:12,flexDirection:"row",alignItems:"center"},profileIcon:{width:46,height:46,borderRadius:23,backgroundColor:colors.surface,alignItems:"center",justifyContent:"center"},profileEmoji:{fontSize:25},profileName:{...typography.title,color:colors.primaryDark,fontWeight:"800"},profileDescription:{...typography.caption,color:colors.textSecondary,marginTop:3},section:{...typography.label,color:colors.text,marginTop:17,marginBottom:8,letterSpacing:.3},vehicleCard:{flexDirection:"row",alignItems:"center"},carIcon:{width:80,height:64,borderRadius:12,backgroundColor:colors.surfaceSecondary,alignItems:"center",justifyContent:"center"},vehicleModel:{...typography.bodyMedium,color:colors.text,fontWeight:"800"},vehicleMeta:{...typography.caption,color:colors.textSecondary,marginTop:2},hint:{...typography.caption,color:colors.primary,marginTop:6},compareCard:{marginTop:12,backgroundColor:colors.surface,borderRadius:16,borderWidth:1,borderColor:colors.border,padding:14},compareTitle:{...typography.bodyMedium,color:colors.text,fontWeight:"800"},compareText:{...typography.caption,color:colors.textSecondary,lineHeight:17,marginTop:4},progress:{height:6,backgroundColor:colors.divider,borderRadius:5,overflow:"hidden",marginTop:11},progressFill:{height:"100%",backgroundColor:colors.primary},progressLabel:{...typography.caption,color:colors.textSecondary,marginTop:5}});}
