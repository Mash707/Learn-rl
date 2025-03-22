import Header from '@/components/Header'
import { UserProfile } from '@clerk/nextjs'
import React from 'react'

const UserProfilePage = () => {
  return (
    <>
        <Header title="profile" subtitle='View your profile'/>
        <UserProfile 
            path = "/user/profile"
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

export default UserProfilePage