import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { whitelabelConfig } from '@/config/whitelabel';
import { useAuthStore } from '@/store/authStore';
import {
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateStrongPassword,
  validateCEP,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
} from '@/utils/validators';
import type { RegisterData } from '@/types/user';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [personType, setPersonType] = useState<'PF' | 'PJ'>('PF');

  // Dados básicos
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dados Pessoa Física
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');

  // Dados Pessoa Jurídica
  const [cnpj, setCnpj] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [legalRepDocument, setLegalRepDocument] = useState('');
  const [legalRepDocumentType, setLegalRepDocumentType] = useState<'RG' | 'CNH'>('RG');

  // Endereço
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Erro no Cadastro', error, [
        { text: 'OK', onPress: () => clearError() },
      ]);
    }
  }, [error]);

  const validateStep1 = (): boolean => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Erro', 'Username deve ter pelo menos 3 caracteres');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert('Erro', 'Username deve conter apenas letras, números e underscore');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return false;
    }

    const passwordValidation = validateStrongPassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Erro', passwordValidation.message || 'Senha inválida');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!phone) {
      Alert.alert('Erro', 'Por favor, preencha o telefone');
      return false;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Erro', 'Telefone inválido. Use o formato (XX) XXXXX-XXXX');
      return false;
    }

    if (personType === 'PF') {
      if (!cpf || !name) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return false;
      }

      if (!validateCPF(cpf)) {
        Alert.alert('Erro', 'CPF inválido');
        return false;
      }
    } else {
      if (!cnpj || !companyName || !legalRepDocument) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return false;
      }

      if (!validateCNPJ(cnpj)) {
        Alert.alert('Erro', 'CNPJ inválido');
        return false;
      }
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    if (!zipCode || !street || !number || !neighborhood || !city || !state) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return false;
    }

    if (!validateCEP(zipCode)) {
      Alert.alert('Erro', 'CEP inválido');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    const registerData: RegisterData = {
      email,
      username,
      phone: phone ? phone.replace(/\D/g, '') : undefined,
      password,
      personType,
      address: {
        zipCode: zipCode.replace(/\D/g, ''),
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      },
    };

    if (personType === 'PF') {
      registerData.cpf = cpf.replace(/\D/g, '');
      registerData.name = name;
    } else {
      registerData.cnpj = cnpj.replace(/\D/g, '');
      registerData.companyName = companyName;
      registerData.legalRepDocument = legalRepDocument;
      registerData.legalRepDocumentType = legalRepDocumentType;
    }

    const success = await register(registerData);

    if (success) {
      router.replace('/(tabs)');
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Dados Básicos</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={username}
        onChangeText={(text) => setUsername(text.toLowerCase())}
        autoCapitalize="none"
        autoComplete="username"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha (mín. 8 caracteres)"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: whitelabelConfig.colors.primary }]}
        onPress={handleNextStep}
      >
        <Text style={styles.buttonText}>Próximo</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Dados Pessoais</Text>

      <TextInput
        style={styles.input}
        placeholder="Telefone (com DDD)"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={phone}
        onChangeText={(text) => setPhone(formatPhone(text))}
        keyboardType="phone-pad"
        maxLength={15}
      />

      <View style={styles.personTypeContainer}>
        <TouchableOpacity
          style={[
            styles.personTypeButton,
            personType === 'PF' && styles.personTypeButtonActive,
          ]}
          onPress={() => setPersonType('PF')}
        >
          <Text
            style={[
              styles.personTypeText,
              personType === 'PF' && styles.personTypeTextActive,
            ]}
          >
            Pessoa Física
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.personTypeButton,
            personType === 'PJ' && styles.personTypeButtonActive,
          ]}
          onPress={() => setPersonType('PJ')}
        >
          <Text
            style={[
              styles.personTypeText,
              personType === 'PJ' && styles.personTypeTextActive,
            ]}
          >
            Pessoa Jurídica
          </Text>
        </TouchableOpacity>
      </View>

      {personType === 'PF' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor={whitelabelConfig.colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="CPF"
            placeholderTextColor={whitelabelConfig.colors.textSecondary}
            value={cpf}
            onChangeText={(text) => setCpf(formatCPF(text))}
            keyboardType="numeric"
            maxLength={14}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Razão Social"
            placeholderTextColor={whitelabelConfig.colors.textSecondary}
            value={companyName}
            onChangeText={setCompanyName}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="CNPJ"
            placeholderTextColor={whitelabelConfig.colors.textSecondary}
            value={cnpj}
            onChangeText={(text) => setCnpj(formatCNPJ(text))}
            keyboardType="numeric"
            maxLength={18}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <TouchableOpacity
                style={[
                  styles.docTypeButton,
                  legalRepDocumentType === 'RG' && styles.docTypeButtonActive,
                ]}
                onPress={() => setLegalRepDocumentType('RG')}
              >
                <Text
                  style={[
                    styles.docTypeText,
                    legalRepDocumentType === 'RG' && styles.docTypeTextActive,
                  ]}
                >
                  RG
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.halfWidth}>
              <TouchableOpacity
                style={[
                  styles.docTypeButton,
                  legalRepDocumentType === 'CNH' && styles.docTypeButtonActive,
                ]}
                onPress={() => setLegalRepDocumentType('CNH')}
              >
                <Text
                  style={[
                    styles.docTypeText,
                    legalRepDocumentType === 'CNH' && styles.docTypeTextActive,
                  ]}
                >
                  CNH
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder={`Número do ${legalRepDocumentType} do representante legal`}
            placeholderTextColor={whitelabelConfig.colors.textSecondary}
            value={legalRepDocument}
            onChangeText={setLegalRepDocument}
            keyboardType="numeric"
          />
        </>
      )}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.buttonSecondaryText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: whitelabelConfig.colors.primary }]}
          onPress={handleNextStep}
        >
          <Text style={styles.buttonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Endereço</Text>

      <TextInput
        style={styles.input}
        placeholder="CEP"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={zipCode}
        onChangeText={(text) => setZipCode(formatCEP(text))}
        keyboardType="numeric"
        maxLength={9}
      />

      <TextInput
        style={styles.input}
        placeholder="Rua/Avenida"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={street}
        onChangeText={setStreet}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="Número"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.inputLarge]}
          placeholder="Complemento (opcional)"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={complement}
          onChangeText={setComplement}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Bairro"
        placeholderTextColor={whitelabelConfig.colors.textSecondary}
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.inputLarge]}
          placeholder="Cidade"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={city}
          onChangeText={setCity}
        />

        <TextInput
          style={[styles.input, styles.inputSmall]}
          placeholder="UF"
          placeholderTextColor={whitelabelConfig.colors.textSecondary}
          value={state}
          onChangeText={(text) => setState(text.toUpperCase())}
          maxLength={2}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonSecondaryText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: whitelabelConfig.colors.primary },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={whitelabelConfig.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Passo {step} de 3</Text>

      <View style={styles.form}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginLink, { color: whitelabelConfig.colors.primary }]}>
            Faça login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: whitelabelConfig.colors.background,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: whitelabelConfig.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: whitelabelConfig.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: whitelabelConfig.colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: whitelabelConfig.colors.white,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    color: whitelabelConfig.colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputSmall: {
    flex: 1,
  },
  inputLarge: {
    flex: 2,
  },
  halfWidth: {
    flex: 1,
  },
  personTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  personTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: whitelabelConfig.colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  personTypeButtonActive: {
    borderColor: whitelabelConfig.colors.primary,
    backgroundColor: `${whitelabelConfig.colors.primary}10`,
  },
  personTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: whitelabelConfig.colors.textSecondary,
  },
  personTypeTextActive: {
    color: whitelabelConfig.colors.primary,
  },
  docTypeButton: {
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  docTypeButtonActive: {
    borderColor: whitelabelConfig.colors.primary,
    backgroundColor: `${whitelabelConfig.colors.primary}10`,
  },
  docTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: whitelabelConfig.colors.textSecondary,
  },
  docTypeTextActive: {
    color: whitelabelConfig.colors.primary,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: whitelabelConfig.colors.background,
    borderWidth: 1,
    borderColor: whitelabelConfig.colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: whitelabelConfig.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: whitelabelConfig.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: whitelabelConfig.colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
