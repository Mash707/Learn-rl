import Header from '@/components/Header'
import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const TeacherProfilePage = () => {
  return (
    <>
        <Header title="profile" subtitle='View your profile'/>
        <UserProfile 
            path = "/teacher/profile"
            routing="path"
            appearance={{
                elements:{
                    navbar: {
                        "& > div:nth-child(1)" : {
                            background : "none",
                        }
                    }
                }
            }}
        />
    </>
  )
}

export default TeacherProfilePage