import { ThemedText } from '@/components/ui/ThemedText'
import { useMainStore } from '@/state/store'
import dayjs from 'dayjs'
import { useEffect, useMemo } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import { LoadingIndicator } from '../ui/LoadingIndicator'
import { withBoundary } from '../withBoundary'
import { LocationCard } from './Card'
import { useLocationPaginator } from './useLocationPaginator'

export const LocationHistoryList = withBoundary(() => {
  const theme = useColorScheme() ?? 'light'

  const { loadMore, loading, locations, hasMore } = useLocationPaginator()
  const { lastSeenHistoryTabAt, setLastSeenHistoryTabAt } = useMainStore()

  // Save this so it's not overwritten by our update.
  const savedLastSeenHistoryTabAt = useMemo(() => {
    return lastSeenHistoryTabAt
  }, [])

  useEffect(() => {
    setLastSeenHistoryTabAt(new Date().toISOString())
  }, [])

  function handleLoadMore() {
    loadMore()
  }

  const sortedLocations = locations.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  if (locations.length === 0 && !loading) {
    return (
      <ThemedText style={styles.emptyState}>No location history yet</ThemedText>
    )
  }

  return (
    <>
      {sortedLocations.map((location) => (
        <LocationCard
          key={location.uniqueId}
          location={location}
          firstSeen={dayjs(location.timestamp).isAfter(
            dayjs(savedLastSeenHistoryTabAt),
          )}
        />
      ))}
      {hasMore && (
        <TouchableOpacity
          style={[
            styles.loadMoreButton,
            {
              backgroundColor: theme === 'light' ? '#f0f0f0' : '#222',
            },
          ]}
          onPress={handleLoadMore}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <ThemedText
              type="defaultSemiBold"
              style={styles.loadMoreText}
              disabled={loading || !hasMore}
            >
              {loading ? <LoadingIndicator size="small" /> : 'Load More'}
            </ThemedText>
          )}
        </TouchableOpacity>
      )}
    </>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingVertical: 20,
    gap: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  view: {
    flex: 1,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    gap: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  source: {
    opacity: 0.7,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.7,
  },
  loadMoreButton: {
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  loadMoreText: {
    color: '#007AFF',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
    borderWidth: 1,
  },
  errorText: {
    color: '#E53E3E',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
})
