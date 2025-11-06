import React, { useState, useContext, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Menu, Portal } from 'react-native-paper';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import BottomSheet, { useBottomSheetSpringConfigs, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const MOCK_TRANSACTIONS = [
  { id: '1', date: '2025-10-28', amount: 'E500.00', status: 'Success', reference: 'XMAS2024-001' },
  { id: '2', date: '2025-10-15', amount: 'E500.00', status: 'Success', reference: 'XMAS2024-002' },
  { id: '3', date: '2025-10-01', amount: 'E250.00', status: 'Pending', reference: 'XMAS2024-003' },
  { id: '4', date: '2025-09-20', amount: 'E500.00', status: 'Success', reference: 'XMAS2024-004' },
];

const PAYMENT_METHODS = [
  { id: 'momo', name: 'MoMo', image: Images.momo || Images.cash, account: '+268 7612 3456' },
  { id: 'instacash', name: 'InstaCash', image: Images.instacash || Images.cash, account: '1234567890' },
  { id: 'society', name: 'Building Society', image: Images.buildingSociety || Images.cash, account: '1234567890' },
  { id: 'cash', name: 'Cash', image: Images.cash || Images.cash, account: 'Treasurer' },
];

export default function MakeContributionScreen({ navigation }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { user } = useContext(AuthContext);

  const [contributionAmount, setContributionAmount] = useState('');
  const [reference, setReference] = useState('');
  const [attchment, setAttachment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);

  const [moreVisible, setMoreVisible] = useState(false);
  const [methodModalVisible, setMethodModalVisible] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Bottom Sheet
  const bottomSheetRef = React.useRef(null);
  const [sheetAmount, setSheetAmount] = useState('');
  const [sheetReference, setSheetReference] = useState('');
  const [sheetPin, setSheetPin] = useState('');
  const snapPoints = useMemo(() => ['25%', '50%', '65%'], []);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const [isPickImg, setIsPickImg] = useState(false);

  const openMoreMenu = () => setMoreVisible(true);
  const closeMoreMenu = () => setMoreVisible(false);

  const openBottomSheet = useCallback(() => {
    setSheetAmount(contributionAmount);
    setSheetReference(reference);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const pickImage = async () => {
    try {
      setIsPickImg(true)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log(result.assets[0])
        setAttachment(result.assets[0]);
      }

    } catch (err) {
      console.error(err)
    } finally {
      setIsPickImg(false)
    }
  };

  const handleMakeContribution = () => {
    if (!sheetAmount || !sheetReference || !sheetPin) {
      Alert.alert('Error', 'Please fill all fields in the payment sheet');
      return;
    }

    Alert.alert(
      'Contribution Submitted',
      `Your contribution of E${sheetAmount} has been submitted via ${paymentMethod.name}.`,
      [
        {
          text: 'OK', onPress: () => {
            setContributionAmount('');
            setReference('');
            setSheetAmount('');
            setSheetReference('');
            setSheetPin('');
            bottomSheetRef.current?.close();
          }
        },
      ]
    );
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: theme.colors.card }]}>
      <View>
        <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.amount}</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>{item.reference}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 12, color: '#666' }}>{item.date}</Text>
        <Text style={{
          fontSize: 12,
          color: item.status === 'Success' ? '#4CAF50' : '#FF9800',
          fontWeight: '600'
        }}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.groupName}>Christmas Savings 2024</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity>
              <Icons.Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Menu
              visible={moreVisible}
              onDismiss={closeMoreMenu}
              anchor={
                <TouchableOpacity onPress={openMoreMenu}>
                  <Icons.Entypo name='dots-three-vertical' size={24} color={theme.colors.text} />
                </TouchableOpacity>
              }
            >
              <Menu.Item title="Group Account" />
              <Menu.Item title="Repay Loans" />
              <Menu.Item title="Admin Outline" />
              <Menu.Item title="Leave Group" />
            </Menu>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Group Info */}
          <View style={[styles.groupInfoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.groupInfoContent}>
              <Text style={styles.groupDetails}>Current Balance</Text>
              <Text style={{ fontSize: 24, color: theme.colors.error, textAlign: 'center' }}>E1,750.00</Text>
              <Text style={styles.groupDetails}>Standard Contribution: E500</Text>
              <View style={{ borderRadius: 20, backgroundColor: theme.colors.sub_card, paddingHorizontal: 10, paddingVertical: 5, marginTop: 10 }}>
                <Text style={styles.groupDetails}>Next Due: 2025-07-15</Text>
              </View>
            </View>
            <View style={[styles.quickActionContainer, { backgroundColor: theme.colors.sub_card }]}>

              <TouchableOpacity style={{ alignItems: 'center' }}>
                <Icons.EvilIcons name='plus' size={20} color={theme.colors.text} />
                <Text style={styles.groupDetails}>Top Up</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignItems: 'center' }}>
                <Icons.MaterialCommunityIcons name='transfer-up' size={15} color={theme.colors.text} />
                <Text style={styles.groupDetails}>Transfer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignItems: 'center' }}>
                <Icons.FontAwesome5 name='layer-group' size={15} color={theme.colors.text} />
                <Text style={styles.groupDetails}>Bills</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignItems: 'center' }}>
                <Icons.MaterialIcons name='dashboard-customize' size={15} color={theme.colors.text} />
                <Text style={styles.groupDetails}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* Payment Method Selector */}
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentMethodSelector}>
              <TouchableOpacity
                style={[styles.paymentMethodOption, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={openBottomSheet}
              >
                <Image source={paymentMethod.image} style={{ height: 50, width: 50 }} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.paymentMethodText, { color: theme.colors.text }]}>{paymentMethod.name}</Text>
                  <Text style={{ fontSize: 11, color: '#666' }}>{paymentMethod.account}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeMethodOption}
                onPress={() => setMethodModalVisible(true)}
              >
                <Icons.MaterialIcons name="change-circle" size={20} color='#FF9800' />
                <Text style={styles.paymentMethodText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => { }}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={MOCK_TRANSACTIONS?.slice(0, 2)}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.formContainer}>
            {/* Accordion: Payment Instructions */}
            <View style={styles.accordion}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setAccordionOpen(!accordionOpen)}
              >
                <Text style={styles.accordionTitle}>Payment Instructions</Text>
                <Icons.Ionicons
                  name={accordionOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              {accordionOpen && (
                <View style={[styles.accordionContent, { backgroundColor: theme.colors.card }]}>
                  {paymentMethod.id === 'momo' && (
                    <>
                      <Text style={styles.instructionStep}>1. Open MoMo app</Text>
                      <Text style={styles.instructionStep}>2. Select "Send Money"</Text>
                      <Text style={styles.instructionStep}>3. Enter: {paymentMethod.account}</Text>
                      <Text style={styles.instructionStep}>4. Amount: E{sheetAmount || '500'}</Text>
                      <Text style={styles.instructionStep}>5. Reference: {sheetReference || 'XMAS2024-XXX'}</Text>
                      <Text style={styles.instructionStep}>6. Enter PIN & approve</Text>
                    </>
                  )}
                  {paymentMethod.id === 'instacash' && (
                    <>
                      <Text style={styles.instructionStep}>1. Open InstaCash</Text>
                      <Text style={styles.instructionStep}>2. Transfer to: {paymentMethod.account}</Text>
                      <Text style={styles.instructionStep}>3. Add reference</Text>
                    </>
                  )}
                  {paymentMethod.id === 'cash' && (
                    <>
                      <Text style={styles.instructionStep}>1. Contact treasurer</Text>
                      <Text style={styles.instructionStep}>2. Hand over cash</Text>
                      <Text style={styles.instructionStep}>3. Get receipt</Text>
                    </>
                  )}
                </View>
              )}
            </View>

            {attchment !== null && (
              <View style={[styles.attachmentContainer, { backgroundColor: theme.colors.sub_card }]}>
                <Image source={{ uri: attchment.uri }} style={styles.attachment} />
                <View>
                  <Text style={styles.groupDetails}>Size: {attchment.fileSize}</Text>
                  <Text style={styles.groupDetails}>File Type: {attchment.type}</Text>
                </View>
                <TouchableOpacity style={styles.removeAttachment} onPress={() => setAttachment(null)}>
                  <Icons.FontAwesome name='remove' size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            )}

            {/* Upload Proof */}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              {isPickImg ?
                <ActivityIndicator size={20} color='#4CAF50' />
                :
                <Icons.FontAwesome5 name="paperclip" size={20} color="#4CAF50" />}
              <Text style={styles.uploadButtonText}>Attach Proof</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Sheet for MoMo Payment */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose={true}
          snapPoints={snapPoints}
          animationConfigs={animationConfigs}
          animateOnMount={true}
          enableHandlePanningGesture={true}
          enableDynamicSizing={false}
          containerStyle={{ borderColor: theme.colors.border }}
          backgroundStyle={{ backgroundColor: theme.colors.sub_card }}
        >
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Pay with {paymentMethod.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="E500.00"
                value={sheetAmount}
                onChangeText={setSheetAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reference</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="XMAS2024-XXX"
                value={sheetReference}
                onChangeText={setSheetReference}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PIN - {paymentMethod.name}</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="••••"
                value={sheetPin}
                onChangeText={setSheetPin}
                secureTextEntry
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <TouchableOpacity style={styles.contributeButton} onPress={handleMakeContribution}>
              <Text style={styles.contributeButtonText}>Submit Contribution</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>

        {/* Payment Method Modal */}
        <Portal>
          <Modal
            visible={methodModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setMethodModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                <Text style={styles.modalTitle}>Choose Payment Method</Text>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.methodOption}
                    onPress={() => {
                      setPaymentMethod(method);
                      setMethodModalVisible(false);
                    }}
                  >
                    <Image source={method.image} style={{ width: 40, height: 40 }} />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: theme.colors.text }}>{method.name}</Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>{method.account}</Text>
                    </View>
                    {paymentMethod.id === method.id && (
                      <Icons.Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setMethodModalVisible(false)}
                >
                  <Text style={{ color: '#666' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </GestureHandlerRootView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  scrollView: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '600', color: '#333' },
  groupInfoCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingBottom: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  groupInfoContent: { marginLeft: 12, flex: 1, alignItems: 'center' },
  quickActionContainer: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  groupDetails: { fontSize: 14, textAlign: 'center', color: '#666' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  viewAll: {
    fontSize: 14,
    textAlign: 'center'
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  formContainer: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  paymentMethodSelector: { flexDirection: 'row', gap: 8 },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  changeMethodOption: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodText: { fontSize: 14, fontWeight: '500', color: '#fff' },

  // Accordion
  accordion: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e9ecef',
  },
  accordionTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  accordionContent: { padding: 16, paddingTop: 8 },
  instructionStep: { fontSize: 14, color: '#666', lineHeight: 20 },

  // Buttons
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 40
  },
  uploadButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  attachmentContainer: {
    flex: 1,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'
  },
  attachment: {
    width: 60,
    height: 60,
    borderRadius: 10,
    objectFit: 'cover',
    marginRight: 10
  },
  removeAttachment: {
    position: 'absolute',
    top: 28,
    right: 20,
  },
  contributeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contributeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },

  // Bottom Sheet
  bottomSheetContent: { padding: 20, flex: 1 },
  bottomSheetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  modalCloseButton: { alignItems: 'center', padding: 12 },
});