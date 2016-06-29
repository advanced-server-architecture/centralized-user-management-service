import GlobalStore from '../stores/GlobalStore';

export const Load = () => 
    GlobalStore.dispatch({ type: 'Load' });

export const Loaded = () => 
    GlobalStore.dispatch({ type: 'Loaded' });
