import useSWR from 'swr';
import { fetchAPI } from '../lib/strapi';

export function useStrapi<T>(path: string, urlParamsObject = {}) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    [path, urlParamsObject],
    () => fetchAPI(path, urlParamsObject)
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useNews(page = 1, pageSize = 10) {
  return useStrapi('/news', {
    pagination: {
      page,
      pageSize,
    },
    populate: '*',
  });
}

export function useEvents(page = 1, pageSize = 10) {
  return useStrapi('/events', {
    pagination: {
      page,
      pageSize,
    },
    populate: '*',
  });
}

export function useResources(page = 1, pageSize = 10) {
  return useStrapi('/resources', {
    pagination: {
      page,
      pageSize,
    },
    populate: '*',
  });
}

export function usePartners() {
  return useStrapi('/partners', {
    populate: '*',
  });
}