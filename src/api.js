import axios from 'axios';

const searchImages = async (term) => {
  const response =  await axios.get('https://api.unsplash.com/search/photos',{
    headers: {
        'Authorization': 'Client-ID 0LoH9SkcEtHlkDjDnXr97f_fnVMWcyTpihyDE0E7sd4',
    },
    params: {
      query: term
    }
  });

  return response.data.results;

}

export default searchImages;