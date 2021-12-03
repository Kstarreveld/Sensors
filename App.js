import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { Line } from 'react-native-svg';

const rivmUrl = "https://services1.arcgis.com/3YlK2vfHGZtonb1r/arcgis/rest/services/RIVM_Sensoren_Fijnstof_(Actuele_gegevens)/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";



export default function App() {
  
  const window = useWindowDimensions();

  const [RIVMdata, setRIVMdata] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0.0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 155, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false // optional
  };


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const url =  rivmUrl;
    const response = await axios.get(url);
    
    const objects = response.data.features;
    
    let objdata = {
        timeofKampen: 0,
        labels:[],
        datasets:[
          {data:[],   color: (opacity = 0.5) => `rgba(50, 205, 100, ${opacity})`},
          {data:[],   color: (opacity = 0.5) => `rgba(134, 65, 244, ${opacity})`,},
          {data:[],   color: (opacity = 0.5) => `rgba(255, 0, 0, ${opacity})`,},
          {data:[],   color: (opacity = 0.5) => `rgba(155, 20, 20, ${opacity})`,},
        ]
    }

    for (let i = 0; i < objects.length; i++) {
        objdata.labels.push(objects[i].attributes.OBJECTID);
        objdata.datasets[0].data.push(objects[i].attributes.result_pm25_kal == null? 0: objects[i].attributes.result_pm25);
        objdata.datasets[1].data.push(objects[i].attributes.result_pm10_kal == null? 0: objects[i].attributes.result_pm25);
        objdata.datasets[2].data.push(50);
        objdata.datasets[3].data.push(25);
        if (objects[i].attributes.OBJECTID == 37 )
        {
          objdata.timeofKampen = new Date(objects[i].attributes.phenomenontime_pm25_kal);
          console.log(objdata.timeofKampen);
        }


    }
    //console.log(objdata);
    setRIVMdata(objdata);
    setLoaded(true);


  };


  return (
    <SafeAreaView>
    <View style={styles.container}>
        { loaded? <View>
          <LineChart
                style={{ alignItems: 'center'}}
                data={RIVMdata}
                width={window.width-20}
                height={window.height-150}
                chartConfig={chartConfig} bezier>
        </LineChart>
        <Text style={{flex:2}}>{RIVMdata.timeofKampen.toString()}</Text></View>:
        <ActivityIndicator></ActivityIndicator>}
        
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
