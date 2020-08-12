import queryString from 'query-string';

const create = async (credentials, expense) => {
  try {
    const response = await fetch('/api/expenses/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${credentials.t}`,
      },
      body: JSON.stringify(expense),
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

const listByUser = async (params, credentials, signal) => {
  const query = queryString.stringify(params);
  try {
    const response = await fetch(`/api/expenses?${query}`, {
      method: 'GET',
      signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${credentials.t}`,
      },
    });
    return await response.json();
  } catch (err) {
    console.log(err);
  }
};

export { create, listByUser };
