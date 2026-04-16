export const parseLinkHeader = (linkHeader) => {
  if (!linkHeader) {
    return {};
  }

  return linkHeader.split(',').reduce((acc, segment) => {
    const match = segment.trim().match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      acc[rel] = url;
    }
    return acc;
  }, {});
};

export const pageFromLink = (url) => {
  if (!url) {
    return null;
  }

  const query = url.split('?')[1];
  if (!query) {
    return null;
  }

  const params = new URLSearchParams(query);
  const page = Number(params.get('page'));
  return Number.isFinite(page) ? page : null;
};

export const readApiError = async (response, fallbackMessage) => {
  try {
    const body = await response.json();
    if (body?.error) {
      return body.error;
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      return body.errors.map((item) => item.msg || item.message).join(', ');
    }
  } catch (err) {
    // no-op
  }

  return fallbackMessage;
};
