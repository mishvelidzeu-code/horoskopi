import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

// ზოდიაქოს ნიშნის გამოთვლის ფუნქცია
const getZodiacSign = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'ვერძი';

  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "მერწყული";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "თევზები";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "ვერძი";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "კურო";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "ტყუპები";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "კირჩხიბი";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "ლომი";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "ქალწული";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "სასწორი";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "მორიელი";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "მშვილდოსანი";
  return "თხის რქა";
};

const GEORGIAN_CITIES = [
  'თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 
  'ზუგდიდი', 'ფოთი', 'თელავი', 'ახალციხე', 'ოზურგეთი', 
  'ცხინვალი', 'სოხუმი'
];

const STEPS = [
  { id: 'name', type: 'text', question: 'რა გქვია?', placeholder: 'შეიყვანე სახელი', icon: 'person-outline' },
  { id: 'gender', type: 'options', question: 'მიუთითე სქესი', options: ['მდედრობითი', 'მამრობითი', 'სხვა'], icon: 'male-female-outline' },
  { id: 'birthDate', type: 'date', question: 'დაბადების თარიღი', placeholder: 'აირჩიე თარიღი', icon: 'calendar-outline' },
  { id: 'birthTime', type: 'time', question: 'დაბადების ზუსტი დრო', placeholder: 'აირჩიე დრო', icon: 'time-outline' },
  { id: 'birthPlace', type: 'options', question: 'დაბადების ადგილი', options: GEORGIAN_CITIES, icon: 'location-outline' },
  { id: 'goal', type: 'options', question: 'რა არის შენი მთავარი მიზანი?', options: ['სიყვარული', 'კარიერა', 'თვითშემეცნება', 'ფინანსები'], icon: 'star-outline' },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date()); 
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    goal: ''
  });

  const flatListRef = useRef<FlatList>(null);

  // განახლებული ფუნქცია: ინახავს მონაცემებს Supabase-ში და მიდის Home-ზე
  const handleNext = async () => {
    Keyboard.dismiss();

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      flatListRef.current?.scrollToIndex({ index: currentStep + 1 });
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const calculatedZodiac = getZodiacSign(formData.birthDate);

        if (user) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              full_name: formData.name,
              gender: formData.gender,
              birth_date: formData.birthDate,
              birth_time: formData.birthTime,
              birth_place: formData.birthPlace,
              goal: formData.goal,
              zodiac_sign: calculatedZodiac,
            });

          if (error) throw error;
        }
        
        // წარმატების შემთხვევაში გადავდივართ პირდაპირ home ეკრანზე
        router.replace('/(tabs)/home');
      } catch (err) {
        console.error('შეცდომა პროფილის შენახვისას:', err);
        // შეცდომის მიუხედავადაც ვუშვებთ თაბებში, რომ არ გაიჭედოს
        router.replace('/(tabs)/home');
      }
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
         saveDateInfo(selectedDate);
      }
    }
  };

  const saveDateInfo = (dateToSave: Date) => {
    const stepId = STEPS[currentStep].id;
    if (stepId === 'birthDate') {
      const year = dateToSave.getFullYear();
      const month = (dateToSave.getMonth() + 1).toString().padStart(2, '0');
      const day = dateToSave.getDate().toString().padStart(2, '0');
      updateField('birthDate', `${year}-${month}-${day}`);
    } else if (stepId === 'birthTime') {
      const hours = dateToSave.getHours().toString().padStart(2, '0');
      const minutes = dateToSave.getMinutes().toString().padStart(2, '0');
      updateField('birthTime', `${hours}:${minutes}`);
    }
    setShowPicker(false);
  }

  const renderItem = ({ item }: any) => {
    const value = formData[item.id as keyof typeof formData];

    return (
      <View style={styles.page}>
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.contentCard}>
          <View style={styles.iconCircle}>
            <Ionicons name={item.icon as any} size={42} color="#00E5FF" />
          </View>
          <Text style={styles.questionText}>{item.question}</Text>

          {item.type === 'options' && (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.optionsContainer} showsVerticalScrollIndicator={false}>
              {item.options.map((option: string) => (
                <TouchableOpacity 
                  key={option} 
                  activeOpacity={0.8}
                  style={[styles.optionBtn, value === option && styles.optionSelected]}
                  onPress={() => updateField(item.id, option)}
                >
                  <Text style={[styles.optionText, value === option && styles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {item.type === 'text' && (
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              placeholderTextColor="#A0A0B0"
              value={value}
              onChangeText={(text) => updateField(item.id, text)}
            />
          )}

          {(item.type === 'date' || item.type === 'time') && (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.pickerBtn}
                onPress={() => {
                  const stepId = STEPS[currentStep].id;

                  if (stepId === "birthTime") {
                    const safeDate = new Date(2000, 5, 15, 12, 0, 0); 
                    if (formData.birthTime) {
                      const [h, m] = formData.birthTime.split(":");
                      safeDate.setHours(Number(h), Number(m), 0, 0);
                    }
                    setTempDate(safeDate);
                  } else {
                    setTempDate(formData.birthDate ? new Date(formData.birthDate) : new Date());
                  }

                  setShowPicker(true);
                }}
              >
                <Text style={[styles.pickerBtnText, !value && { color: '#A0A0B0' }]}>
                  {value || item.placeholder}
                </Text>
                <Ionicons name={item.icon as any} size={24} color="#00E5FF" />
              </TouchableOpacity>
              
              {showPicker && item.id === STEPS[currentStep].id && (
                <View style={Platform.OS === 'ios' ? styles.iosPickerContainer : null}>
                  <DateTimePicker
                    key={`picker-${item.id}-${currentStep}`}
                    value={tempDate}
                    mode={item.type as any}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    maximumDate={item.type === 'date' ? new Date() : new Date(2100, 0, 1)}
                    textColor="#FFFFFF"
                    themeVariant="dark"
                    locale={item.type === 'time' ? 'en-GB' : undefined}
                    minuteInterval={1}
                  />

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.confirmBtn}
                      onPress={() => saveDateInfo(tempDate)}
                    >
                      <Text style={styles.confirmBtnText}>დადასტურება</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </Animated.View>
      </View>
    );
  };

  const isCurrentStepValid = !!formData[STEPS[currentStep].id as keyof typeof formData];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#070711" />
      
      {/* ღრმა კოსმოსური ფონი */}
      <LinearGradient colors={['#070711', '#141028', '#0A0A1A']} style={StyleSheet.absoluteFill} />

      <View style={styles.topGlow} />
      
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${((currentStep + 1) / STEPS.length) * 100}%` }]} />
        </View>
        <Text style={styles.stepCounter}>{currentStep + 1} / {STEPS.length}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextBtnContainer, !isCurrentStepValid && styles.nextBtnDisabled]} 
          onPress={handleNext}
          disabled={!isCurrentStepValid}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={!isCurrentStepValid ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] : ['#00E5FF', '#007FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextBtn}
          >
            <Text style={[styles.nextBtnText, !isCurrentStepValid && { color: '#8A8A9D' }]}>
              {currentStep === STEPS.length - 1 ? 'დასრულება' : 'შემდეგი'}
            </Text>
            <Ionicons name="chevron-forward" size={22} color={!isCurrentStepValid ? '#8A8A9D' : '#FFF'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070711' },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 24, alignItems: 'center' },
  progressContainer: { height: 6, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, marginBottom: 12 },
  progressBar: { height: '100%', backgroundColor: '#00E5FF', borderRadius: 3, shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5 },
  stepCounter: { color: '#A0A0B0', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  page: { width, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contentCard: { width: '100%', alignItems: 'center', flex: 1, marginTop: 20 },
  iconCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: 'rgba(0, 229, 255, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 35,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5,
  },
  questionText: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 40, letterSpacing: 0.5 },
  input: { 
    width: '100%', 
    height: 65, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    color: '#FFFFFF', 
    fontSize: 17, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  scrollView: { width: '100%', maxHeight: height * 0.5 }, 
  optionsContainer: { gap: 14, paddingBottom: 20 },
  optionBtn: { 
    width: '100%', 
    padding: 20, 
    borderRadius: 20, 
    backgroundColor: 'rgba(20, 16, 40, 0.6)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)', 
    alignItems: 'center' 
  },
  optionSelected: { 
    borderColor: '#00E5FF', 
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  optionText: { color: '#A0A0B0', fontSize: 16, fontWeight: '700' },
  optionTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  pickerBtn: { 
    width: '100%', 
    height: 65, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  pickerBtnText: { color: '#FFFFFF', fontSize: 17 },
  iosPickerContainer: { 
    backgroundColor: 'rgba(20, 16, 40, 0.9)', 
    borderRadius: 24, 
    marginTop: 15, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  confirmBtn: { backgroundColor: '#00E5FF', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 15 },
  confirmBtnText: { color: '#070711', fontWeight: '800', fontSize: 16 },
  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  nextBtnContainer: { 
    width: '100%', 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5,
  },
  nextBtnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
  nextBtn: { height: 65, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  nextBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});