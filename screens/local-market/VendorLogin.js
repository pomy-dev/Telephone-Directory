import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Icons } from '../../constants/Icons';
import {
  Button,
  Card,
  Text
} from 'react-native-paper';
import { AppContext } from '../../context/appContext';

export default function LoginScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)

  const handleVendorLogin = () => {
    navigation.navigate('AddVendor');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icons.Ionicons name='arrow-back' style={{ color: theme.colors.primary, fontSize: 24 }} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.colors.primary }]}>Local Market</Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>

        <Card style={[styles.vendorCard, { borderColor: theme.colors.primary, backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text style={[styles.vendorTitle, { color: theme.colors.accent }]}>Are you a vendor?</Text>
            <Text style={[styles.vendorSubtitle, { color: theme.colors.placeholder }]}>
              Join our marketplace to reach more customers and connect with bulk buying groups
            </Text>

            <Button
              mode="outlined"
              onPress={handleVendorLogin}
              style={[styles.vendorButton, { borderColor: theme.colors.primary }]}
              contentStyle={styles.buttonContent}
            >
              Vendor Registration
            </Button>
          </Card.Content>
        </Card>

        {/* Continue Button */}
        <Button
          mode="contained"
          // onPress={() => navigation.navigate('VendorHome')}
          onPress={() => navigation.navigate('GroupManagement')}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Continue as Guest
        </Button>

        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: theme.colors.indicator }]}>Why Choose Our Platform?</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>Discover local vendors near you</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>Join bulk buying groups for better prices</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>Fast delivery to your location</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={[styles.featureText, { color: theme.colors.text }]}>Real-time stock updates</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginTop: 50
  },
  backButton: {
    position: 'absolute', left: 0, padding: 10
  },
  headerText: {
    position: 'absolute', left: '30%', textAlign: 'center', fontSize: 24, fontWeight: 'bold',
  },
  vendorCard: {
    marginTop: 60,
    marginHorizontal: 20,
    marginTop: 0,
    elevation: 4,
    borderWidth: 1,
  },
  vendorTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  vendorSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  loginButton: {
    marginHorizontal: 8,
    marginVertical: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  features: {
    margin: 20,
    marginTop: 0,
  },
  featuresTitle: {
    textAlign: 'center',
    marginBottom: 20
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
  },
});
