import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/colors';

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'PETUGAS') return <Redirect href="/(officer)" />;
    return <Redirect href="/(user)" />;
  }

  return <Redirect href="/(onboarding)" />;
}
