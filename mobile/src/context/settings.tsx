import {createContext, ReactNode, useEffect, useState} from "react";
import {createAsyncStorage} from "@react-native-async-storage/async-storage";

type setting = string | undefined

type Settings = {
    host: setting;
    port: setting;
    outputFolder: setting;
    saveData: (newHost: setting, newPort: setting, newOutputFolder: setting) => void;
}

type JSONSettings = {
    host?: setting
    port?: setting
    outputFolder?: setting
}

export const SettingsContext = createContext<Settings | undefined>(undefined)

export const SettingsProvider = ({children}: {children: ReactNode}) => {
    const [host, setHost] = useState<setting>("0.0.0.0")
    const [port, setPort] = useState<setting>("4296")
    const [outputFolder, setOutputFolder] = useState<setting>("")

    const storage = createAsyncStorage("localconvert")

    const loadData = async () => {
        try {
            const data = await storage.getItem("SETTINGS")

            if (data){
                const jsonData: JSONSettings = JSON.parse(data)
                if(jsonData.host != undefined){
                    setHost(jsonData.host)
                }

                if(jsonData.port != undefined){
                    setPort(jsonData.port)
                }

                if(jsonData.outputFolder != undefined){
                    setOutputFolder(jsonData.outputFolder)
                }
            }
        } catch(e) {
            console.error("Failed to load settings from storage ", e)
        }
    }

    const saveData = async (newHost: setting, newPort: setting, newOutputFolder: setting) => {
        const data = JSON.stringify({host: newHost, port: newPort, outputFolder: newOutputFolder})

        setHost(newHost)
        setPort(newPort)
        setOutputFolder(newOutputFolder)
        await storage.setItem("SETTINGS", data)
    }

    useEffect(() => {

        loadData()
    }, [])

    return (
        <SettingsContext value={{host, port, outputFolder, saveData}}>
            {children}
        </SettingsContext>
    )
}

