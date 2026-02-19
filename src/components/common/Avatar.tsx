import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, typography } from '../../theme';

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: number;
}

export function Avatar({ name, url, size = 36 }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = getColorFromName(name);

  if (url) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

interface AvatarGroupProps {
  members: { name: string; avatar_url?: string | null }[];
  max?: number;
  size?: number;
}

export function AvatarGroup({ members, max = 4, size = 32 }: AvatarGroupProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <View style={styles.group}>
      {visible.map((m, i) => (
        <View key={i} style={[styles.groupItem, { marginLeft: i === 0 ? 0 : -size * 0.3 }]}>
          <Avatar name={m.name} url={m.avatar_url} size={size} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={[
            styles.avatar,
            styles.groupItem,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.bgElevated,
              marginLeft: -size * 0.3,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.32 }]}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

function getColorFromName(name: string): string {
  const palette = ['#7C5CFC', '#F472B6', '#60A5FA', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  initials: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    zIndex: 1,
  },
});
