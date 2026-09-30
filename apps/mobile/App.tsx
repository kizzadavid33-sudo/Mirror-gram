import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, Text, View, StyleSheet } from 'react-native'

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.logo}>Mirror Gram</Text>
        <Text style={styles.subtitle}>Create. Connect. Be discovered.</Text>
        <Text style={styles.body}>
          Mobile app foundation. Connect this client to the same Supabase project
          and share the same database and authentication model as the web app.
        </Text>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7faf8' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 34, fontWeight: '800', color: '#168a4a' },
  subtitle: { marginTop: 8, fontSize: 18, color: '#607067' },
  body: { marginTop: 28, lineHeight: 24, color: '#102019' }
})
