import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const tarefasIniciais = [
  { id: '1', titulo: 'Estudar React Native', descricao: 'Revisar componentes, props e estado.', concluida: false },
  { id: '2', titulo: 'Organizar o quarto', descricao: 'Guardar roupas e organizar a mesa.', concluida: true },
  { id: '3', titulo: 'Fazer atividade', descricao: 'Finalizar os exercícios da faculdade.', concluida: false }
];

function Botao({ titulo, aoPressionar, tipo = 'principal' }) {
  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [
        stylesBotao.botao,
        tipo === 'secundario' ? stylesBotao.secundario : stylesBotao.principal,
        pressed && stylesBotao.pressionado
      ]}
    >
      <Text style={[stylesBotao.texto, tipo === 'secundario' && stylesBotao.textoSecundario]}>
        {titulo}
      </Text>
    </Pressable>
  );
}

function Cabecalho({ titulo, descricao }) {
  return (
    <View style={stylesCabecalho.container}>
      <Text style={stylesCabecalho.titulo}>{titulo}</Text>
      <Text style={stylesCabecalho.descricao}>{descricao}</Text>
    </View>
  );
}

function Card({ titulo, subtitulo, concluida, aoPressionar, aoConcluir }) {
  return (
    <Pressable onPress={aoPressionar} style={stylesCard.card}>
      <View style={stylesCard.conteudo}>
        <View style={stylesCard.textos}>
          <Text style={[stylesCard.titulo, concluida && stylesCard.riscado]}>{titulo}</Text>
          <Text style={stylesCard.subtitulo}>{subtitulo || 'Sem descrição'}</Text>
          <Text style={stylesCard.status}>{concluida ? 'Concluída' : 'Pendente'}</Text>
        </View>
        <Pressable onPress={aoConcluir} style={stylesCard.acao}>
          <Text style={stylesCard.acaoTexto}>{concluida ? 'Desfazer' : 'Concluir'}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function Home({ navigation, tarefas, carregando, aoAlternar }) {
  const [filtro, setFiltro] = useState('Todas');
  const [tarefasExibidas, setTarefasExibidas] = useState([]);

  useEffect(() => {
    let resultado = tarefas;

    if (filtro === 'Pendentes') {
      resultado = tarefas.filter(tarefa => !tarefa.concluida);
    } else if (filtro === 'Concluídas') {
      resultado = tarefas.filter(tarefa => tarefa.concluida);
    }

    setTarefasExibidas(resultado);
  }, [tarefas, filtro]);

  const abrirDetalhes = (tarefa) => {
    navigation.navigate('Detalhes', { tarefa });
  };

  return (
    <View style={stylesHome.container}>
      <Cabecalho titulo="Organize seu dia" descricao="Adicione tarefas e acompanhe seu progresso." />

      <View style={stylesHome.filtros}>
        {['Todas', 'Pendentes', 'Concluídas'].map(opcao => (
          <Text
            key={opcao}
            onPress={() => setFiltro(opcao)}
            style={[stylesHome.filtro, filtro === opcao && stylesHome.filtroAtivo]}
          >
            {opcao}
          </Text>
        ))}
      </View>

      <Botao titulo="+ Adicionar tarefa" aoPressionar={() => navigation.navigate('Formulario')} />

      {carregando ? (
        <ActivityIndicator size="large" color="#5B4B8A" style={stylesHome.loading} />
      ) : (
        <FlatList
          data={tarefasExibidas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card
              titulo={item.titulo}
              subtitulo={item.descricao}
              concluida={item.concluida}
              aoPressionar={() => abrirDetalhes(item)}
              aoConcluir={() => aoAlternar(item.id)}
            />
          )}
          ListEmptyComponent={<Text style={stylesHome.vazio}>Nenhuma tarefa encontrada.</Text>}
          contentContainerStyle={stylesHome.lista}
        />
      )}
    </View>
  );
}

function Detalhes({ route, navigation }) {
  const { tarefa } = route.params;

  return (
    <View style={stylesDetalhes.container}>
      <Cabecalho titulo="Detalhes" descricao="Confira as informações desta tarefa." />
      <View style={stylesDetalhes.card}>
        <Text style={stylesDetalhes.titulo}>{tarefa.titulo}</Text>
        <Text style={stylesDetalhes.descricao}>{tarefa.descricao || 'Nenhuma descrição informada.'}</Text>
        <Text style={stylesDetalhes.status}>Status: {tarefa.concluida ? 'Concluída' : 'Pendente'}</Text>
      </View>
      <Botao titulo="Voltar para a lista" aoPressionar={() => navigation.goBack()} tipo="secundario" />
    </View>
  );
}

function Formulario({ navigation, aoSalvar }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');

  const salvar = () => {
    if (titulo.trim() === '') {
      Alert.alert('Atenção', 'Digite um título para a tarefa.');
      return;
    }

    aoSalvar({ titulo: titulo.trim(), descricao: descricao.trim() });
    navigation.goBack();
  };

  return (
    <View style={stylesFormulario.container}>
      <Cabecalho titulo="Nova tarefa" descricao="Preencha os campos abaixo." />

      <Text style={stylesFormulario.label}>Título</Text>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Ex.: Estudar para a prova"
        style={stylesFormulario.input}
        maxLength={60}
      />

      <Text style={stylesFormulario.label}>Descrição</Text>
      <TextInput
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Adicione uma descrição (opcional)"
        style={[stylesFormulario.input, stylesFormulario.multiline]}
        multiline
        numberOfLines={4}
      />

      <Botao titulo="Salvar tarefa" aoPressionar={salvar} />
      <Botao titulo="Cancelar" aoPressionar={() => navigation.goBack()} tipo="secundario" />
    </View>
  );
}

export default function App() {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Simula a leitura inicial de dados locais ao abrir o aplicativo.
    const carregarTarefas = async () => {
      setCarregando(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setTarefas(tarefasIniciais);
      setCarregando(false);
    };

    carregarTarefas();
  }, []);

  const adicionarTarefa = (novaTarefa) => {
    setTarefas(tarefasAtuais => [
      { ...novaTarefa, id: Date.now().toString(), concluida: false },
      ...tarefasAtuais
    ]);
  };

  const alternarConclusao = (id) => {
    setTarefas(tarefasAtuais =>
      tarefasAtuais.map(tarefa =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#5B4B8A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#F5F3FA' }
        }}
      >
        <Stack.Screen name="Inicio" options={{ title: 'Minhas tarefas' }}>
          {props => (
            <Home
              {...props}
              tarefas={tarefas}
              carregando={carregando}
              aoAlternar={alternarConclusao}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Detalhes" component={Detalhes} options={{ title: 'Detalhes da tarefa' }} />

        <Stack.Screen name="Formulario" options={{ title: 'Nova tarefa' }}>
          {props => <Formulario {...props} aoSalvar={adicionarTarefa} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const stylesBotao = StyleSheet.create({
  botao: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center', marginVertical: 6 },
  principal: { backgroundColor: '#5B4B8A' },
  secundario: { backgroundColor: '#E8E3F2', borderWidth: 1, borderColor: '#5B4B8A' },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  textoSecundario: { color: '#5B4B8A' },
  pressionado: { opacity: 0.75 }
});

const stylesCabecalho = StyleSheet.create({
  container: { marginBottom: 18 },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#292333' },
  descricao: { color: '#686273', marginTop: 5, fontSize: 14 }
});

const stylesCard = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  conteudo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textos: { flex: 1, paddingRight: 8 },
  titulo: { color: '#292333', fontSize: 16, fontWeight: 'bold' },
  riscado: { textDecorationLine: 'line-through', color: '#777' },
  subtitulo: { color: '#686273', marginTop: 5, fontSize: 13 },
  status: { color: '#5B4B8A', marginTop: 8, fontSize: 12, fontWeight: 'bold' },
  acao: { backgroundColor: '#EEEAF5', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8 },
  acaoTexto: { color: '#5B4B8A', fontWeight: 'bold', fontSize: 12 }
});

const stylesHome = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  filtros: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  filtro: { paddingVertical: 8, paddingHorizontal: 10, color: '#686273', borderRadius: 8, overflow: 'hidden' },
  filtroAtivo: { backgroundColor: '#E5DFF0', color: '#5B4B8A', fontWeight: 'bold' },
  lista: { paddingTop: 12, paddingBottom: 24, flexGrow: 1 },
  vazio: { textAlign: 'center', color: '#686273', marginTop: 30 },
  loading: { marginTop: 35 }
});

const stylesDetalhes = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, elevation: 2 },
  titulo: { fontSize: 20, color: '#292333', fontWeight: 'bold' },
  descricao: { color: '#686273', fontSize: 15, marginTop: 12, lineHeight: 22 },
  status: { color: '#5B4B8A', fontWeight: 'bold', marginTop: 18 }
});

const stylesFormulario = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { color: '#292333', fontWeight: 'bold', marginBottom: 7, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#D9D3E5', borderWidth: 1, borderRadius: 9, padding: 13, fontSize: 15, color: '#292333' },
  multiline: { minHeight: 105, textAlignVertical: 'top' }
});
