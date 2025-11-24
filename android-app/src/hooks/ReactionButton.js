import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Modal, 
  Pressable 
} from 'react-native';

const REACTIONS = [
  { type: 'ME_GUSTA', emoji: '👍', label: 'Me gusta', color: '#1877F2' },
  { type: 'ME_ENCANTA', emoji: '❤️', label: 'Me encanta', color: '#F33E58' },
  { type: 'ME_DIVIERTE', emoji: '😂', label: 'Me divierte', color: '#F7B125' },
  { type: 'ME_ASOMBRA', emoji: '😮', label: 'Me asombra', color: '#F7B125' },
  { type: 'ME_TRISTE', emoji: '😢', label: 'Me entristece', color: '#F7B125' },
  { type: 'ME_ENOJA', emoji: '😠', label: 'Me enoja', color: '#E9710F' }
];

const ReactionButton = ({ 
  currentReaction, 
  onReactionSelect, 
  textColor = '#000', 
  muted = '#666' 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [buttonLayout, setButtonLayout] = useState(null);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pickerAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef(null);

  const activeReaction = REACTIONS.find(r => r.type === currentReaction);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const showReactionPicker = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setButtonLayout({ x: pageX, y: pageY, width, height });
      });
    }
    
    setShowPicker(true);
    Animated.spring(pickerAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const hideReactionPicker = () => {
    Animated.timing(pickerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const handleLongPress = () => {
    setLongPressActive(true);
    showReactionPicker();
  };

  const handlePress = () => {
    if (!longPressActive) {
      if (currentReaction) {
        onReactionSelect(null);
      } else {
        onReactionSelect('ME_GUSTA');
      }
    }
    setLongPressActive(false);
  };

  const selectReaction = (reactionType) => {
    onReactionSelect(reactionType === currentReaction ? null : reactionType);
    hideReactionPicker();
    setLongPressActive(false);
  };

  return (
    <View style={styles.reactionContainer} ref={buttonRef}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={300}
          style={styles.reactionButton}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionEmoji}>
            {activeReaction ? activeReaction.emoji : '👍'}
          </Text>
          <Text style={[
            styles.reactionText,
            { color: activeReaction ? activeReaction.color : muted }
          ]}>
            {activeReaction ? activeReaction.label : 'Me gusta'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {showPicker && buttonLayout && (
        <Modal transparent visible={showPicker} animationType="none">
          <Pressable 
            style={styles.pickerOverlay} 
            onPress={hideReactionPicker}
          >
            <Animated.View
              style={[
                styles.reactionPicker,
                {
                  position: 'absolute',
                  left: buttonLayout.x - 10,
                  top: buttonLayout.y - 70, 
                  opacity: pickerAnim,
                  transform: [
                    {
                      translateY: pickerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      scale: pickerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction.type}
                  onPress={() => selectReaction(reaction.type)}
                  style={[
                    styles.reactionItem,
                    currentReaction === reaction.type && styles.reactionItemActive
                  ]}
                >
                  <Text style={styles.reactionItemEmoji}>
                    {reaction.emoji}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reactionContainer: {
    position: 'relative',
    flex: 1,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  reactionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reactionItemActive: {
    backgroundColor: '#f0f2f5',
    transform: [{ scale: 1.1 }],
  },
  reactionItemEmoji: {
    fontSize: 28,
  },
});

export default ReactionButton;