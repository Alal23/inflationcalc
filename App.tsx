import {View, Button, StyleSheet, Text, TextInput} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  hasCrashedInLastSession,
  lastSessionCrashReport,
} from 'appcenter-crashes';
import {trackEvent} from 'appcenter-analytics';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import CodePush from 'react-native-code-push';

const CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: 'a new update is available!',
  },
};

const App = () => {
  const [state, setState] = useState({
    inflationRate: 0.0,
    riskFreeRate: 0.0,
    amount: 0.0,
    timeInYears: 1,
    afterInflation: 0.0,
    atRiskFree: 0.0,
    atRiskFreeAfterInflation: 0.0,
    difference: 0,
  });
  const checkPreviousSession = useCallback(async () => {
    const didCrash = await hasCrashedInLastSession();
    if (didCrash) {
      await lastSessionCrashReport();
      alert("Sorry about that crash, we'working on a solution");
    }
  }, []);
  useEffect(() => {
    checkPreviousSession();
  }, [checkPreviousSession]);
  const onChangeText = (key: string, value: string) => {
    setState(prev => ({
      ...prev,
      [`${key}`]: value,
    }));
  };
  const calculateInflationImpact = (
    value: number,
    inflationRate: number,
    time: number,
  ) => {
    return value / Math.pow(1 + inflationRate, time);
  };
  const calculate = () => {
    const afterInflation = calculateInflationImpact(
      state.amount,
      state.inflationRate / 100,
      state.timeInYears,
    );
    const atRiskFree =
      state.amount * Math.pow(1 + state.riskFreeRate / 100, state.timeInYears);
    const atRiskFreeAfterInflation = calculateInflationImpact(
      atRiskFree,
      state.inflationRate / 100,
      state.timeInYears,
    );
    const difference = atRiskFreeAfterInflation - afterInflation;
    setState(prev => ({
      ...prev,
      afterInflation,
      atRiskFree,
      atRiskFreeAfterInflation,
      difference,
    }));
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Current inflation rate"
        style={styles.textBox}
        keyboardType="decimal-pad"
        onChangeText={inflationRate =>
          onChangeText('inflationRate', inflationRate)
        }
      />
      <TextInput
        placeholder="Current risk free rate"
        style={styles.textBox}
        keyboardType="decimal-pad"
        onChangeText={riskFreeRate =>
          onChangeText('riskFreeRate', riskFreeRate)
        }
      />
      <TextInput
        placeholder="Amount you want to save"
        style={styles.textBox}
        keyboardType="decimal-pad"
        onChangeText={amount => onChangeText('amount', amount)}
      />
      <TextInput
        placeholder="For how long (in years) will you save?"
        style={styles.textBox}
        keyboardType="decimal-pad"
        onChangeText={timeInYears => onChangeText('timeInYears', timeInYears)}
      />
      <View style={styles.mt30} />
      <Button
        title="Calculate inflation"
        onPress={() => {
          calculate();
          trackEvent('calculate_inflation', {
            Internet: 'WiFi',
            GPS: 'Off',
          });
        }}
      />
      <Text style={styles.label}>
        {state.timeInYears} years from now you will still have ${state.amount}{' '}
        but it will only be worth ${state.afterInflation}.
      </Text>
      <Text style={styles.label}>
        But if you invest it at a risk free rate you will have $
        {state.atRiskFree}.
      </Text>
      <Text style={styles.label}>
        Which will be worth ${state.atRiskFreeAfterInflation} after inflation.
      </Text>
      <Text style={styles.label}>A difference of: ${state.difference}.</Text>
      <Text>Testing file changed only android and ios 123</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 16,
  },
  label: {
    marginTop: 10,
  },
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  mt30: {
    marginTop: 30,
  },
});

export default CodePush(CodePushOptions)(App);
