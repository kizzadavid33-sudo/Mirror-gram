import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

const MIRROR_GRAM_URL = 'https://mirror-gram.vercel.app'

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: MIRROR_GRAM_URL }}
        style={styles.webview}
        originWhitelist={['https://*', 'http://*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        startInLoadingState
      />
    </>
  )
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
})
