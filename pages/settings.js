import Head from "next/head"
import Sidebar from "@/components/Sidebar"
import axios from "axios"
import { useState } from "react"
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/router"

export default function Settings(props) {
    const router = useRouter()

    const [streamSettings, setStreamSettings] = useState({
        streamName: props.streamName
    })

    const updateStreamName = async (e) => {
        e.preventDefault()

        let err = document.getElementById('streamNameError')

        err.innerText = ''

        let res = await axios.post(process.env.NEXT_PUBLIC_API_HOST + '/settings/updateStreamName', {
            token: props.token,
            newStreamName: streamSettings.streamName
        })

        if(res.data.success) {
            err.innerText = 'Stream name changed'
        } else {
            err.innerText = 'Failed to change stream name'
        }
    }

    const logOut = () => {
        deleteCookie('token')
        router.push('/login')
    }

    return (
        <>
            <Head>
                <title>Settings</title>
            </Head>
            <Sidebar />
            <main className="flex flex-col gap-10 mt-5 md:mt-[80px] md:ml-[150px]">
                <div className="flex flex-col items-center md:items-start gap-3">
                    <span className="text-[30px] font-medium">How to stream?</span>
                    <span>RTMP server:</span>
                    <code className="p-3 bg-gray-600 md:mr-10 md:rounded-md select-all">rtmp://rtmp.flowee.ru/live</code>
                    <span>Your stream token:</span>
                    <code className="p-3 bg-gray-600 md:mr-10 md:rounded-md select-all">{props.streamToken}</code>
                    <span>Use it in your streaming software settings</span>
                    <span><b>Never share it to anyone</b>, everyone who has this token can do streams as you!</span>
                </div>
                <div className="flex flex-col items-center md:items-start gap-3">
                    <span className="text-[30px] font-medium">Stream</span>
                    
                    <div className="flex flex-col gap-1">
                        <span>Stream name</span>
                        <form className="flex gap-3" onSubmit={updateStreamName}>
                            <input type="text" placeholder={props.streamName} onChange={(e) => {setStreamSettings({ ...streamSettings, streamName: e.target.value })}} />
                            <button type="submit" className="bg-[gray]">Update</button>
                        </form>
                        <span className="text-gray-100" id="streamNameError"></span>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start gap-3">
                    <span className="text-[30px] font-medium">Danger Zone</span>
                    
                    <button className="bg-red-600" onClick={logOut}>Log out</button>
                </div>
            </main>
        </>
    )
}

export async function getServerSideProps(ctx) {
    let token = ctx.req.cookies.token

    if(!token) {
        return {
            redirect: {
                permanent: false,
                destination: '/login'
            }
        }
    }

    let res = await axios.get(process.env.NEXT_PUBLIC_API_HOST + '/settings/getSettings?token=' + token)

    if(!res.data.success) {
        return {
            redirect: {
                permanent: false,
                destination: '/login'
            }
        }
    }

    return {
        props: {
            ...res.data,
            token
        }
    }
}