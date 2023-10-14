import {View, Button, StyleSheet} from 'react-native';
import React, {useCallback, useEffect} from 'react';
import {
  generateTestCrash,
  hasCrashedInLastSession,
  lastSessionCrashReport,
} from 'appcenter-crashes';
import {trackEvent} from 'appcenter-analytics';

const App = () => {
  const checkPreviousSession = useCallback(async () => {
    const didCrash = await hasCrashedInLastSession();
    console.log('didCrash', didCrash);
    if (didCrash) {
      await lastSessionCrashReport();
      alert("Sorry about that crash, we'working on a solution");
    }
  }, []);
  useEffect(() => {
    checkPreviousSession();
  }, [checkPreviousSession]);
  return (
    <View style={styles.container}>
      <Button
        title="crash"
        onPress={() => {
          console.log('testing');
          // generateTestCrash();
          // throw new Error('testing error');
          // trackEvent('calculate_inflation');
          trackEvent('calculate_inflation', {Internet: 'Wifi', GPS: 'Off'});
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
