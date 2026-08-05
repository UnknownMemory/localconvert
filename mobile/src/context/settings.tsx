import {createContext, ReactNode, useState} from "react";
import {Paths} from "expo-file-system";

type Settings = {
    host: string
    port: string
    outputFolder: string
}

export const SettingsContext = createContext<Settings | undefined>(undefined)

export const SettingsProvider = ({children}: {children: ReactNode}) => {
    const [host, setHost] = useState<string>("0.0.0.0")
    const [port, setPort] = useState<string>("4296")
    const [outputFolder, setOutputFolder] = useState<string>(Paths.document.name + "/localconvert")

    return (
        <SettingsContext value={{host, port, outputFolder}}>
            {children}
        </SettingsContext>
    )
}

