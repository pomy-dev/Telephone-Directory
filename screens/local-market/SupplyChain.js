// SupplyChainScreen.js
import { Icons } from '../../constants/Icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { Badge, Card, Chip, Text } from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';
import { mockSuppliers, mockBrokers, mockFinanceOffers } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';
import { ScrollView } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

export default function SupplyChainScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [selectedTab, setSelectedTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [financeOffers, setFinanceOffers] = useState([]);

  useEffect(() => {
    setSuppliers(mockSuppliers);
    setBrokers(mockBrokers);
    setFinanceOffers(mockFinanceOffers);
  }, []);

  const handleContact = (item, type) => {
    Alert.alert(
      `Contact ${type}`,
      `Contact ${item.name}?\n\nPhone: ${item.contact.phone}\nEmail: ${item.contact.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Call ${type}`) },
        { text: 'Email', onPress: () => console.log(`Email ${type}`) },
      ]
    );
  };

  const renderAdCard = ({ item }) => (
    <Card style={styles.adCard}>
      <Image source={{ uri: item.image }} style={styles.adImage} />
      <Card.Content>
        <Text style={[styles.adTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.adDesc, { color: theme.colors.placeholder }]}>{item.desc}</Text>
      </Card.Content>
    </Card>
  );

  const renderEntityCard = ({ item, type }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Card.Content>
        <View style={styles.entityHeader}>
          <Image source={{ uri: item.logo }} style={styles.entityLogo} />
          <View style={styles.entityInfo}>
            <Text style={styles.entityName}>{item.name}</Text>
            <Text style={[styles.entityType, { color: theme.colors.placeholder }]}>
              {type === 'suppliers' ? `${item.type} • ${item.category}` : item.specialty || item.offer}
            </Text>
          </View>
          <Badge style={[styles.ratingBadge, { backgroundColor: theme.colors.success }]}>
            {item.rating} ({item.reviewCount})
          </Badge>
        </View>

        <Text style={[styles.entityDescription, { color: theme.colors.text }]}>{item.description}</Text>

        <View style={styles.entityDetails}>
          <View style={styles.detailRow}>
            <Icons.Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icons.Feather name="phone" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.contact.phone}</Text>
          </View>
          {type === 'suppliers' && (
            <View style={styles.detailRow}>
              <Icons.Ionicons name="receipt-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>Min Order: E{item.minOrder}</Text>
            </View>
          )}
        </View>

        {type === 'suppliers' && (
          <View style={styles.productsContainer}>
            <Text style={[styles.productsTitle, { color: theme.colors.text }]}>Products:</Text>
            <View style={styles.productsList}>
              {item.products.map((product, index) => (
                <Chip key={index} style={[styles.productChip, { backgroundColor: '#F8FAFC', borderColor: theme.colors.border }]} compact>
                  {product}
                </Chip>
              ))}
            </View>
          </View>
        )}

        <View style={styles.marketingContainer}>
          <Text style={[styles.marketingTitle, { color: theme.colors.text }]}>Why Choose Us:</Text>
          <Text style={[styles.marketingText, { color: theme.colors.text }]}>{item.marketingInfo}</Text>
        </View>

        <View style={styles.dealsContainer}>
          <Text style={[styles.dealsTitle, { color: theme.colors.text }]}>Deals & Offers:</Text>
          <Carousel
            width={screenWidth - 80}
            height={180}
            data={item.deals}
            renderItem={renderAdCard}
            loop
            autoPlay
            autoPlayInterval={3000}
            scrollAnimationDuration={1000}
          />
        </View>

        <View style={styles.entityActions}>
          <TouchableOpacity
            onPress={() => handleContact(item, type)}
            style={[styles.actionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.inidcator }]}
          >
            <Icons.Feather name='phone' size={24} color={'#cccccc'} />
            <Text style={{ textAlign: 'center', colors: theme.colors.text }}>Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Engage', `Engage with ${item.name} for ${type}`)}
            style={[styles.actionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.indicator }]}
          >
            {type === 'suppliers'
              ? <Icons.FontAwesome name='search-plus' size={24} color={'#cccccc'} />
              : <Icons.FontAwesome5 name='handshake' size={24} color={'#cccccc'} />
            }
            <Text style={{ color: '#cccccc' }}>{type === 'suppliers' ? 'View More' : 'Engage'}</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'suppliers':
        return (
          <FlatList
            data={suppliers}
            renderItem={({ item }) => renderEntityCard({ item, type: 'suppliers' })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'brokers':
        return (
          <FlatList
            data={brokers}
            renderItem={({ item }) => renderEntityCard({ item, type: 'brokers' })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'finance':
        return (
          <FlatList
            data={financeOffers}
            renderItem={({ item }) => renderEntityCard({ item, type: 'finance' })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Supply Chain</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.sub_text }]}>
          Connect with industry
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'suppliers' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('suppliers')}
          >
            <Icons.Ionicons
              name="business-outline"
              size={20}
              color={selectedTab === 'suppliers' ? '#cccccc' : theme.colors.placeholder}
            />
            <Text style={[styles.tabText, selectedTab === 'suppliers' && styles.activeTabText]}>
              Suppliers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'brokers' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('brokers')}
          >
            <Icons.Ionicons
              name="people-outline"
              size={20}
              color={selectedTab === 'brokers' ? 'white' : theme.colors.placeholder}
            />
            <Text style={[styles.tabText, selectedTab === 'brokers' && styles.activeTabText]}>
              Brokers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'finance' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('finance')}
          >
            <Icons.Ionicons
              name="cash-outline"
              size={20}
              color={selectedTab === 'finance' ? 'white' : theme.colors.placeholder}
            />
            <Text style={[styles.tabText, selectedTab === 'finance' && styles.activeTabText]}>
              Finance
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {renderTabContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderWidth: 1
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 35
  },
  headerTitle: {
    marginLeft: '28%',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tab: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    backgroundColor: '#F0F4FF'
  },
  activeTab: {
    backgroundColor: "#003366"
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 50,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  entityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entityLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  entityInfo: {
    flex: 1,
  },
  entityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entityType: {
    fontSize: 14,
  },
  ratingBadge: {
    color: 'white',
    fontSize: 10,
  },
  entityDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  entityDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  productsContainer: {
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  marketingContainer: {
    marginBottom: 16,
  },
  marketingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marketingText: {
    fontSize: 14,
  },
  dealsContainer: {
    marginBottom: 16,
  },
  dealsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  adCard: {
    width: 180,
    marginRight: 8,
  },
  adImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  adDesc: {
    fontSize: 12,
  },
  entityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
});