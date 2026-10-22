import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface DraggableFabProps {
  onPress: () => void;
  storageKey: string; // chave do AsyncStorage onde a posição do botão fica salva
  accessibilityLabel: string;
}

type Point = { x: number; y: number };
type Area = { width: number; height: number };

const FAB_SIZE = 60;
const EDGE_MARGIN = 8; // distância mínima entre o botão e as bordas da tela
const DEFAULT_OFFSET = 24; // posição inicial: canto inferior direito
const DRAG_THRESHOLD = 6; // a partir de quantos pixels o toque vira arrasto

//---------------------- mantém o botão dentro da área da tela ----------------------
const clamp = (point: Point, area: Area): Point => ({
  x: Math.min(
    Math.max(point.x, EDGE_MARGIN),
    area.width - FAB_SIZE - EDGE_MARGIN,
  ),
  y: Math.min(
    Math.max(point.y, EDGE_MARGIN),
    area.height - FAB_SIZE - EDGE_MARGIN,
  ),
});

//---------------------- botão + que pode ser arrastado para qualquer lugar ----------------------
// Toque rápido: chama onPress. Arrastar: muda o botão de lugar e salva a posição.
const DraggableFab: React.FC<DraggableFabProps> = ({
  onPress,
  storageKey,
  accessibilityLabel,
}) => {
  const [area, setArea] = useState<Area | null>(null);
  const [ready, setReady] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const position = useRef<Point>({ x: 0, y: 0 });
  const areaRef = useRef<Area | null>(null);
  const isDragging = useRef(false);

  // o PanResponder é criado uma vez só, então ele lê as props mais recentes por refs
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  //------------------- posição inicial: a que foi salva ou o canto inferior direito -------------------
  useEffect(() => {
    if (!area) return;
    let active = true;

    const loadPosition = async () => {
      let start: Point = {
        x: area.width - FAB_SIZE - DEFAULT_OFFSET,
        y: area.height - FAB_SIZE - DEFAULT_OFFSET,
      };
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
            start = { x: parsed.x, y: parsed.y };
          }
        }
      } catch (error) {
        console.error("Erro ao carregar a posição do botão", error);
      }
      if (!active) return;
      position.current = clamp(start, area);
      pan.setValue(position.current);
      setReady(true);
    };

    loadPosition();
    return () => {
      active = false;
    };
  }, [area, storageKey]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    areaRef.current = { width, height };
    setArea((prev) =>
      prev && prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  };

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  //------------------- confirma a nova posição e salva -------------------
  const commitPosition = (dx: number, dy: number) => {
    const currentArea = areaRef.current;
    if (!currentArea) return;
    position.current = clamp(
      { x: position.current.x + dx, y: position.current.y + dy },
      currentArea,
    );
    pan.setValue(position.current);
    AsyncStorage.setItem(
      storageKeyRef.current,
      JSON.stringify(position.current),
    ).catch((error) =>
      console.error("Erro ao salvar a posição do botão", error),
    );
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        isDragging.current = false;
        animateScale(0.92);
      },
      onPanResponderMove: (_, gesture) => {
        const currentArea = areaRef.current;
        if (!currentArea) return;
        // movimentos pequenos ainda contam como toque
        if (
          !isDragging.current &&
          Math.abs(gesture.dx) < DRAG_THRESHOLD &&
          Math.abs(gesture.dy) < DRAG_THRESHOLD
        ) {
          return;
        }
        if (!isDragging.current) {
          isDragging.current = true;
          animateScale(1.08);
        }
        pan.setValue(
          clamp(
            {
              x: position.current.x + gesture.dx,
              y: position.current.y + gesture.dy,
            },
            currentArea,
          ),
        );
      },
      onPanResponderRelease: (_, gesture) => {
        animateScale(1);
        if (isDragging.current) {
          commitPosition(gesture.dx, gesture.dy);
        } else {
          onPressRef.current();
        }
      },
      onPanResponderTerminate: (_, gesture) => {
        animateScale(1);
        if (isDragging.current) {
          commitPosition(gesture.dx, gesture.dy);
        }
      },
    }),
  ).current;

  return (
    <View style={styles.area} onLayout={handleLayout}>
      {ready && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.container, { transform: pan.getTranslateTransform() }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint="Arraste para mudar o botão de lugar"
          accessibilityActions={[{ name: "activate" }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "activate") onPress();
          }}
        >
          <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
            <Ionicons name="add" size={30} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ocupa a tela toda sem bloquear os toques na lista que está por baixo
  area: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },

  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
  },

  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default DraggableFab;
