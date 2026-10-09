import { router } from 'expo-router';
import { LogOut, Settings, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { MenuGroup, MenuRow } from '@/components/MenuRow';
import { PostCard } from '@/components/PostCard';
import { PostMenu, type MenuTarget } from '@/components/PostMenu';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AVATAR_COUNT } from '@/config';
import { useTheme } from '@/hooks/useTheme';
import { strings } from '@/i18n/en';
import { useAuth } from '@/lib/auth';
import { useMyPosts, useSavedPosts } from '@/lib/posts';
import { radii, spacing } from '@/theme';

const copy = strings.profile;
const AVATAR_IDS = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1);

/** Private to the signed-in person: nobody else can ever open this page. */
export default function ProfileScreen() {
  const theme = useTheme();
  const { profile, signOut, setAvatar } = useAuth();
  const [tab, setTab] = useState<'mine' | 'saved'>('mine');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [menu, setMenu] = useState<MenuTarget | null>(null);
  const mine = useMyPosts();
  const saved = useSavedPosts();
  const list = tab === 'mine' ? mine : saved;

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ScreenHeader title={copy.title} />
      <Screen>
        <View style={styles.identity}>
          <Avatar id={profile?.avatar_id ?? 1} size={96} />
          <AppText variant="title">{profile?.username}</AppText>
          <AppText color={theme.textSecondary} style={styles.center}>
            {copy.onlyYou}
          </AppText>
          <Button variant="text" label={copy.changeAvatar} onPress={() => setAvatarOpen(true)} />
        </View>

        <MenuGroup>
          <MenuRow icon={Settings} label={copy.settings} onPress={() => router.push('/settings')} />
          {profile?.role === 'moderator' ? (
            <MenuRow icon={ShieldAlert} label={copy.modQueue} onPress={() => router.push('/mod')} />
          ) : null}
        </MenuGroup>

        <View style={styles.tabs} accessibilityRole="radiogroup">
          <Chip role="radio" label={copy.myPosts} selected={tab === 'mine'} onPress={() => setTab('mine')} />
          <Chip role="radio" label={copy.saved} selected={tab === 'saved'} onPress={() => setTab('saved')} />
        </View>

        {list.isError ? <AppText color={theme.danger}>{strings.common.genericError}</AppText> : null}
        {list.data?.length === 0 ? (
          <AppText color={theme.textSecondary} style={styles.center}>
            {tab === 'mine' ? copy.noPosts : copy.noSaved}
          </AppText>
        ) : null}
        {list.data?.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpen={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
            onMenu={() =>
              setMenu({ targetType: 'post', id: post.id, isMine: post.is_mine, isSaved: post.is_saved })
            }
          />
        ))}

        <MenuGroup>
          <MenuRow icon={LogOut} label={copy.signOut} onPress={signOut} />
        </MenuGroup>
      </Screen>

      <BottomSheet visible={avatarOpen} title={copy.avatarTitle} onClose={() => setAvatarOpen(false)}>
        <View style={styles.avatars} accessibilityRole="radiogroup">
          {AVATAR_IDS.map((id) => {
            const selected = id === profile?.avatar_id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityLabel={strings.createAccount.avatarOption(id)}
                accessibilityState={{ selected }}
                onPress={() => {
                  setAvatar(id).catch(() => {});
                  setAvatarOpen(false);
                }}
                style={[styles.avatar, { borderColor: selected ? theme.primary : 'transparent' }]}>
                <Avatar id={id} size={56} />
              </Pressable>
            );
          })}
        </View>
        <AppText variant="label" color={theme.textSecondary}>
          {strings.createAccount.avatarHelp}
        </AppText>
      </BottomSheet>
      <PostMenu target={menu} onClose={() => setMenu(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  center: {
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  avatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  avatar: {
    padding: 3,
    borderWidth: 3,
    borderRadius: radii.pill,
  },
});
