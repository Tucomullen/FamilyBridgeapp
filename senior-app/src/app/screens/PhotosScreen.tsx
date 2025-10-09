import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert, ActivityIndicator, Share } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { t } from '../i18n';
import { logEvent } from '../telemetry/logEvent';
import { photoService, Photo } from '../services/PhotoService';
import { cameraManager } from '../services/CameraManager';

type Props = {
  navigation: any;
};

export default function PhotosScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);

  useEffect(() => {
    initializePhotos();
  }, []);

  const initializePhotos = async () => {
    try {
      await photoService.initialize();
      await cameraManager.initialize();
      const allPhotos = photoService.getAllPhotos();
      setPhotos(allPhotos);
      
      // If no photos, add some mock photos for demonstration
      if (allPhotos.length === 0) {
        await addMockPhotos();
      }
      
      setIsLoading(false);
      console.log('📷 PhotosScreen initialized with', allPhotos.length, 'photos');
    } catch (error) {
      console.error('📷 Failed to initialize photos:', error);
      setIsLoading(false);
    }
  };

  const addMockPhotos = async () => {
    const mockPhotos = [
      { title: 'Familia en Navidad', emoji: '🎄' },
      { title: 'Cumpleaños de María', emoji: '🎂' },
      { title: 'Vacaciones en la playa', emoji: '🏖️' },
      { title: 'Reunión familiar', emoji: '👨‍👩‍👧‍👦' },
      { title: 'Nietos jugando', emoji: '🧸' },
      { title: 'Cena especial', emoji: '🍽️' },
    ];

    for (const mock of mockPhotos) {
      const photo = {
        id: `mock-${Date.now()}-${Math.random()}`,
        uri: 'mock://photo',
        title: mock.title,
        timestamp: Date.now(),
        size: 0,
        width: 300,
        height: 300,
        isLocal: true,
      };
      await photoService.addPhoto(photo);
    }

    const updatedPhotos = photoService.getAllPhotos();
    setPhotos(updatedPhotos);
  };

  const nextPhoto = async () => {
    if (photos.length === 0) return;
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    await logEvent('photos_next', { index: nextIndex, total: photos.length });
  };

  const selectPhoto = async (index: number) => {
    setCurrentIndex(index);
    await logEvent('photos_select', { index, total: photos.length });
  };

  const takePhoto = async () => {
    try {
      setIsTakingPhoto(true);
      const photo = await cameraManager.takePhoto();
      
      if (photo) {
        const updatedPhotos = photoService.getAllPhotos();
        setPhotos(updatedPhotos);
        setCurrentIndex(0); // Show the new photo
        await logEvent('photos_take', { photoId: photo.id });
        Alert.alert('¡Éxito!', 'Foto tomada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    } catch (error) {
      console.error('📷 Failed to take photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      setIsTakingPhoto(true);
      const photo = await cameraManager.selectFromGallery();
      
      if (photo) {
        const updatedPhotos = photoService.getAllPhotos();
        setPhotos(updatedPhotos);
        setCurrentIndex(0); // Show the new photo
        await logEvent('photos_select_gallery', { photoId: photo.id });
        Alert.alert('¡Éxito!', 'Foto seleccionada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo seleccionar la foto');
      }
    } catch (error) {
      console.error('📷 Failed to select photo from gallery:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const shareCurrentPhoto = async () => {
    if (photos.length === 0 || !currentPhoto) return;
    
    try {
      const shareOptions = {
        title: `Compartir: ${currentPhoto.title}`,
        message: `¡Mira esta foto de FamilyBridge! ${currentPhoto.title}`,
        url: currentPhoto.uri !== 'mock://photo' ? currentPhoto.uri : undefined,
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        await logEvent('photos_share', { photoId: currentPhoto.id, method: result.activityType || 'unknown' });
        console.log('📷 Photo shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('📷 Photo sharing dismissed');
      }
    } catch (error) {
      console.error('📷 Failed to share photo:', error);
      Alert.alert('Error', 'No se pudo compartir la foto');
    }
  };

  const deleteCurrentPhoto = async () => {
    if (photos.length === 0) return;
    
    const currentPhoto = photos[currentIndex];
    Alert.alert(
      'Eliminar foto',
      `¿Estás seguro de que quieres eliminar "${currentPhoto.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await photoService.removePhoto(currentPhoto.id);
            if (success) {
              const updatedPhotos = photoService.getAllPhotos();
              setPhotos(updatedPhotos);
              
              // Adjust current index if needed
              if (updatedPhotos.length === 0) {
                setCurrentIndex(0);
              } else if (currentIndex >= updatedPhotos.length) {
                setCurrentIndex(updatedPhotos.length - 1);
              }
              
              await logEvent('photos_delete', { photoId: currentPhoto.id });
              Alert.alert('¡Éxito!', 'Foto eliminada correctamente');
            } else {
              Alert.alert('Error', 'No se pudo eliminar la foto');
            }
          },
        },
      ]
    );
  };

  const currentPhoto = photos[currentIndex];

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.highContrastBg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.l,
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { color: colors.text, marginTop: spacing.m }]}>
          Cargando fotos...
        </Text>
      </View>
    );
  }

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
          backgroundColor: colors.surface,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
          borderWidth: 2,
          borderColor: colors.primary,
          overflow: 'hidden',
        }}>
          {currentPhoto ? (
            currentPhoto.uri === 'mock://photo' ? (
              // Mock photo display
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 80, marginBottom: spacing.m }}>
                  {currentPhoto.title.includes('Navidad') ? '🎄' :
                   currentPhoto.title.includes('Cumpleaños') ? '🎂' :
                   currentPhoto.title.includes('playa') ? '🏖️' :
                   currentPhoto.title.includes('Reunión') ? '👨‍👩‍👧‍👦' :
                   currentPhoto.title.includes('Nietos') ? '🧸' :
                   currentPhoto.title.includes('Cena') ? '🍽️' : '📷'}
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
            ) : (
              // Real photo display
              <Image
                source={{ uri: currentPhoto.uri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )
          ) : (
            <Text style={[typography.body, { color: colors.mutedText }]}>
              No hay fotos
            </Text>
          )}
        </View>

        {/* Photo Counter */}
        <Text 
          style={[typography.body, { 
            color: colors.mutedText, 
            textAlign: 'center',
            marginBottom: spacing.xl,
          }]}
        >
          {photos.length > 0 ? `${currentIndex + 1} de ${photos.length}` : '0 fotos'}
        </Text>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: spacing.m,
          marginBottom: spacing.xl,
        }}>
          {/* Take Photo Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            onPress={takePhoto}
            disabled={isTakingPhoto}
            style={{
              padding: spacing.l,
              backgroundColor: colors.primary,
              borderRadius: 12,
              minWidth: 120,
              alignItems: 'center',
              opacity: isTakingPhoto ? 0.6 : 1,
            }}
          >
            {isTakingPhoto ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                📷 Tomar
              </Text>
            )}
          </Pressable>

          {/* Select from Gallery Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Seleccionar de galería"
            onPress={selectFromGallery}
            disabled={isTakingPhoto}
            style={{
              padding: spacing.l,
              backgroundColor: colors.success,
              borderRadius: 12,
              minWidth: 120,
              alignItems: 'center',
              opacity: isTakingPhoto ? 0.6 : 1,
            }}
          >
            {isTakingPhoto ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[typography.button, { color: colors.text }]}>
                🖼️ Galería
              </Text>
            )}
          </Pressable>
        </View>

        {/* Navigation Buttons */}
        {photos.length > 0 && (
          <View style={{
            flexDirection: 'row',
            gap: spacing.m,
            marginBottom: spacing.xl,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('photos.cta.next')}
              onPress={nextPhoto}
              style={{
                padding: spacing.l,
                backgroundColor: colors.surface,
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
              }}
            >
              <Text style={[typography.button, { color: colors.text }]}>
                {t('photos.cta.next')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartir foto"
              onPress={shareCurrentPhoto}
              style={{
                padding: spacing.l,
                backgroundColor: colors.primary,
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
              }}
            >
              <Text style={[typography.button, { color: colors.text }]}>
                📤 Compartir
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Eliminar foto"
              onPress={deleteCurrentPhoto}
              style={{
                padding: spacing.l,
                backgroundColor: colors.danger || '#FF6B6B',
                borderRadius: 12,
                minWidth: 100,
                alignItems: 'center',
              }}
            >
              <Text style={[typography.button, { color: colors.text }]}>
                🗑️ Eliminar
              </Text>
            </Pressable>
          </View>
        )}

        {/* Photo Thumbnails */}
        {photos.length > 0 && (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: spacing.s,
            marginBottom: spacing.xl,
          }}>
            {photos.map((photo, index) => (
              <Pressable
                key={photo.id}
                accessibilityRole="button"
                accessibilityLabel={`Ver ${photo.title}`}
                onPress={() => selectPhoto(index)}
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: index === currentIndex ? 3 : 1,
                  borderColor: index === currentIndex ? colors.primary : colors.mutedText,
                  overflow: 'hidden',
                }}
              >
                {photo.uri === 'mock://photo' ? (
                  <Text style={{ fontSize: 24 }}>
                    {photo.title.includes('Navidad') ? '🎄' :
                     photo.title.includes('Cumpleaños') ? '🎂' :
                     photo.title.includes('playa') ? '🏖️' :
                     photo.title.includes('Reunión') ? '👨‍👩‍👧‍👦' :
                     photo.title.includes('Nietos') ? '🧸' :
                     photo.title.includes('Cena') ? '🍽️' : '📷'}
                  </Text>
                ) : (
                  <Image
                    source={{ uri: photo.thumbnailUri || photo.uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                )}
              </Pressable>
            ))}
          </View>
        )}
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
