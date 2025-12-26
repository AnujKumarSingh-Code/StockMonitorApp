import { Redirect } from 'expo-router';

// This redirects to the main tabs explore
export default function ExploreRedirect() {
  return <Redirect href="/(tabs)" />;
}
