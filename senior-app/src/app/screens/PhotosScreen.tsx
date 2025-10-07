import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { logEvent } from '../telemetry/logEvent';

type Props = {
  navigation: any;
};

interface MockPhoto {
  id: string;
  title: string;
  color: string;
  emoji: string;
}

const mockPhotos: MockPhoto[] = [
  { id: '1', title: 'Familia en Navidad', color: colors.primary, emoji: '🎄' },
  { id: '2', title: 'Cumpleaños de María', color: colors.success, emoji: '🎂' },
  { id: '3', title: 'Vacaciones en la playa', color: colors.surface, emoji: '🏖️' },
  { id: '4', title: 'Reunión familiar', color: colors.primary, emoji: '👨‍👩‍👧‍👦' },
  { id: '5', title: 'Nietos jugando', color: colors.success, emoji: '🧸' },
  { id: '6', title: 'Cena especial', color: colors.surface, emoji: '🍽️' },
];

export default function PhotosScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = async () => {
    const nextIndex = (currentIndex + 1) % mockPhotos.length;
    setCurrentIndex(nextIndex);
    await logEvent('photos_next', { index: nextIndex, total: mockPhotos.length });
  };

  const currentPhoto = mockPhotos[currentIndex];

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.highContrastBg,
      padding: spacing.l,
    }}>
      <Text 
        accessibilityRole="header"
        style={[typography.h1, { color: colors.text, textAlign: 'center', marginBottom: spacing.xl }]}
      >
        {t('photos.title')}
      </Text>

      <ScrollView 
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Display */}
        <View style={{
          width: 280,
          height: 280,
          backgroundColor: currentPhoto.color,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
          borderWidth: 2,
          borderColor: colors.surface,
        }}>
          <Text style={{ fontSize: 80, marginBottom: spacing.m }}>
            {currentPhoto.emoji}
          </Text>
          <Text 
            style={[typography.h2, { 
              color: colors.text, 
              textAlign: 'center',
              paddingHorizontal: spacing.m,
            }]}
          >
            {currentPhoto.title}
          </Text>
        </View>

        {/* Photo Counter */}
        <Text 
          style={[typography.body, { 
            color: colors.mutedText, 
            textAlign: 'center',
            marginBottom: spacing.xl,
          }]}
        >
          {currentIndex + 1} de {mockPhotos.length}
        </Text>

        {/* Next Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('photos.cta.next')}
          onPress={nextPhoto}
          style={{
            padding: spacing.xl,
            backgroundColor: colors.primary,
            borderRadius: 12,
            minWidth: 200,
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}
        >
          <Text style={[typography.button, { color: colors.text }]}>
            {t('photos.cta.next')}
          </Text>
        </Pressable>

        {/* Photo Thumbnails */}
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: spacing.s,
          marginBottom: spacing.xl,
        }}>
          {mockPhotos.map((photo, index) => (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              accessibilityLabel={`Ver ${photo.title}`}
              onPress={() => setCurrentIndex(index)}
              style={{
                width: 60,
                height: 60,
                backgroundColor: photo.color,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: index === currentIndex ? 3 : 1,
                borderColor: index === currentIndex ? colors.text : colors.surface,
              }}
            >
              <Text style={{ fontSize: 24 }}>
                {photo.emoji}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => navigation.goBack()}
        style={{
          padding: spacing.l,
          backgroundColor: colors.surface,
          borderRadius: 12,
          minWidth: 120,
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <Text style={[typography.button, { color: colors.text }]}>
          {t('common.back')}
        </Text>
      </Pressable>
    </View>
  );
}
