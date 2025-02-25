'use client'

import { FaRegEye, FaRegCalendarAlt } from 'react-icons/fa'
import { IoIosArrowDown } from 'react-icons/io'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { FiEdit2 } from 'react-icons/fi'
import { RiDeleteBin7Line } from 'react-icons/ri'
import Header from '@/components/Header'
import style from '../../assets/styles/equipe.module.css'
import DateSelector from '@/components/DateSelector'
import LocationSelector from '@/components/LocationSelector'
import EnrollSelector from '@/components/EnrollSelector'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
const ViewLead = dynamic(() => import('@/components/ViewLead'), {
  ssr: false,
})
const EditLead = dynamic(() => import('@/components/EditLead'), {
  ssr: false,
})
const DeleteLead = dynamic(() => import('@/components/DeleteLead'), {
  ssr: false,
})
import dynamic from 'next/dynamic'
import HeaderMobile from '@/components/HeaderMobile'
import AsideMobile from '@/components/AsideMobile'
const Aside = dynamic(() => import('@/components/Aside'), {
  ssr: false,
})

interface Lead {
  id: number
  name: string
  location: string
  enroll: boolean
  interest: boolean
}

interface Query {
  startDate: {
    day: number
    month: number
    year: number
  }
  endDate: {
    day: number
    month: number
    year: number
  }
}

export default function Leads() {
  const router = useRouter()
  const date = useMemo(() => new Date(), [])

  const [query, setQuery] = useState<Query>({
    startDate: {
      day: 1,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
    endDate: {
      day: date.getDate() + 1,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  })
  const [openDateSelector, setOpenDateSelector] = useState(false)
  const [openLocationSelector, setOpenLocationSelector] = useState(false)
  const [openEnrollSelector, setOpenEnrollSelector] = useState(false)
  const [dateText, setDateText] = useState('')
  const [location, setLocation] = useState<string>('')
  const [cities, setCities] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [enrollText, setEnrollText] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [currentLeadId, setCurrentLeadId] = useState(0)
  const [openViewLead, setOpenViewLead] = useState(false)
  const [openEditLead, setOpenEditLead] = useState(false)
  const [openDeleteLead, setOpenDeleteLead] = useState(false)
  const [showBlur, setShowBlur] = useState(false)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1279)
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (openViewLead || openEditLead || openDeleteLead) {
      setShowBlur(true)
    } else {
      setShowBlur(false)
    }
  }, [openDeleteLead, openEditLead, openViewLead])

  const compareDates = (
    startDate: { day: number; month: number; year: number },
    endDate: { day: number; month: number; year: number },
    date: Date
  ) => {
    const formatDate = (d: { day: number; month: number; year: number }) =>
      `${d.day}/${d.month}/${d.year}`

    const today = {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }

    const tomorrow = {
      day: date.getDate() + 1,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }

    const yesterday = {
      day: date.getDate() - 1,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }

    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    const week = {
      day: startOfWeek.getDate() + 1,
      month: startOfWeek.getMonth() + 1,
      year: startOfWeek.getFullYear(),
    }

    const startOfMonth = {
      day: 1,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }

    const startOfYear = { day: 1, month: 1, year: date.getFullYear() }

    if (
      formatDate(startDate) === formatDate(today) &&
      formatDate(endDate) === formatDate(tomorrow)
    ) {
      return 'Hoje'
    } else if (
      formatDate(startDate) === formatDate(yesterday) &&
      formatDate(endDate) === formatDate(today)
    ) {
      return 'Ontem'
    } else if (
      formatDate(startDate) === formatDate(week) &&
      formatDate(endDate) === formatDate(tomorrow)
    ) {
      return 'Esta semana'
    } else if (
      formatDate(startDate) === formatDate(startOfMonth) &&
      formatDate(endDate) === formatDate(tomorrow)
    ) {
      return 'Este mês'
    } else if (
      formatDate(startDate) === formatDate(startOfYear) &&
      formatDate(endDate) === formatDate(tomorrow)
    ) {
      return 'Este ano'
    } else {
      return `${startDate.day}/${startDate.month}/${startDate.year} - ${endDate.day}/${endDate.month}/${endDate.year}`
    }
  }

  useEffect(() => {
    const text = compareDates(query.startDate, query.endDate, date)
    setDateText(text)
  }, [date, query])

  const fetchLeads = useCallback(() => {
    const token = localStorage.getItem('jwt')

    if (!token) {
      return
    }

    fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/lead?${
        query.startDate.day && query.startDate.month && query.startDate.year
          ? `startDate=${query.startDate.year}-${query.startDate.month}-${query.startDate.day}&`
          : ''
      }${
        query.endDate.day && query.endDate.month && query.endDate.year
          ? `endDate=${query.endDate.year}-${query.endDate.month}-${query.endDate.day}`
          : ''
      }${location ? `&location=${location}` : ''}${
        enrollText && enrollText !== 'Indiferente'
          ? `&enroll=${enrollText === 'Sim' ? 'true' : 'false'}`
          : ''
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          router.push('/')
          return
        }

        return res.json()
      })
      .then((data) => {
        if (data) {
          setLeads(data.leads)
        }
      })
  }, [
    enrollText,
    location,
    query.endDate.day,
    query.endDate.month,
    query.endDate.year,
    query.startDate.day,
    query.startDate.month,
    query.startDate.year,
    router,
  ])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const [nonQueriedLeads, setNonQueriedLeads] = useState<Lead[]>([])

  useEffect(() => {
    const token = localStorage.getItem('jwt')

    if (!token) {
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/lead`, {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          router.push('/')
          return
        }

        return res.json()
      })
      .then((data) => {
        if (data) {
          setNonQueriedLeads(data.leads)
        }
      })
  }, [router])

  useEffect(() => {
    const newCities: string[] = []

    nonQueriedLeads.forEach((lead) => {
      if (!newCities.includes(lead.location) && lead.location !== location) {
        newCities.push(lead.location)
      }
    })

    setCities(newCities)
  }, [location, nonQueriedLeads])

  const employeeNameEllipsis = (name: string) => {
    if (!name) {
      return
    }

    if (name.trim().length >= 30) {
      return name.trim().split('').slice(0, 27).join('') + '...'
    }

    return name.trim()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const [key, subKey] = name.split('.') as [
      keyof Query,
      keyof Query[keyof Query]
    ]

    setQuery({
      ...query,
      [key]: {
        ...query[key],
        [subKey]: value,
      },
    })
  }

  const searchLeadsOutput = leads?.filter((lead) =>
    lead.name.trim().toLowerCase().includes(search.trim().toLowerCase())
  )

  const [showAsideMobile, setShowAsideMobile] = useState(false)

  return (
    <main className={style.main}>
      <Aside />
      {isMobile && <HeaderMobile setShowAsideMobile={setShowAsideMobile} />}

      {showAsideMobile && (
        <AsideMobile setShowAsideMobile={setShowAsideMobile} />
      )}

      <section className={style.section}>
        <Header />

        <div className={style.mainDiv}>
          <div
            className={style.viewEmployeeLeads}
            style={{ padding: '1.5rem' }}
          >
            <span className={style.viewEmployeeDataDivSpan}>Leads</span>

            <ul className={style.viewEmployeeLeadsUl}>
              <li
                className={style.viewEmployeeLeadsUlLi}
                onClick={() => setOpenDateSelector(!openDateSelector)}
              >
                <div className={style.viewEmployeeLeadsUlLiDiv}>
                  <span className={style.viewEmployeeDataDivNameDivSpan}>
                    Intervalo de dados
                  </span>

                  <div className={style.viewEmployeeLeadsUlLiDivInput}>
                    <FaRegCalendarAlt
                      className={style.viewEmployeeLeadsUlLiDivInputSvg}
                    />

                    <span className={style.orderByFilterUlLiSpan}>
                      {dateText}
                    </span>
                  </div>
                </div>

                <IoIosArrowDown
                  className={style.viewEmployeeLeadsUlLiDivInputSvg}
                  style={
                    openDateSelector
                      ? { transform: 'rotate(180deg)' }
                      : undefined
                  }
                />
              </li>

              {openDateSelector && (
                <DateSelector
                  startDate={query.startDate}
                  endDate={query.endDate}
                  handleChange={handleChange}
                  date={date}
                  setOpenDateSelector={setOpenDateSelector}
                  setDateText={setDateText}
                  top={isMobile ? 16.8 : 20}
                  setQuery={setQuery}
                />
              )}

              <li
                className={style.viewEmployeeLeadsUlLi}
                onClick={() => setOpenLocationSelector(!openLocationSelector)}
              >
                <div className={style.viewEmployeeLeadsUlLiDiv}>
                  <span className={style.viewEmployeeDataDivNameDivSpan}>
                    Localidade
                  </span>

                  <span className={style.orderByFilterUlLiSpan}>
                    {!location ? 'Todas' : location}
                  </span>
                </div>

                <IoIosArrowDown
                  className={style.viewEmployeeLeadsUlLiDivInputSvg}
                  style={
                    openLocationSelector
                      ? { transform: 'rotate(180deg)' }
                      : undefined
                  }
                />
              </li>

              {openLocationSelector && (
                <LocationSelector
                  cities={cities}
                  setLocation={setLocation}
                  setOpenLocationSelector={setOpenLocationSelector}
                  top={isMobile ? 21 : 20}
                  right={
                    isMobile
                      ? 'unset'
                      : localStorage.getItem('closedAside') === 'false'
                      ? 31.8
                      : 34.8
                  }
                />
              )}

              <li className={style.funcionariosSearch}>
                <FaMagnifyingGlass />

                <input
                  type="search"
                  placeholder="Pesquisar"
                  className={style.funcionariosSearchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </li>

              <li
                className={style.viewEmployeeLeadsUlLi}
                onClick={() => setOpenEnrollSelector(!openEnrollSelector)}
              >
                <div className={style.viewEmployeeLeadsUlLiDiv}>
                  <span className={style.viewEmployeeDataDivNameDivSpan}>
                    Matriculado
                  </span>

                  <span className={style.orderByFilterUlLiSpan}>
                    {enrollText ? enrollText : 'Indiferente'}
                  </span>
                </div>

                <IoIosArrowDown
                  className={style.viewEmployeeLeadsUlLiDivInputSvg}
                  style={
                    openEnrollSelector
                      ? { transform: 'rotate(180deg)' }
                      : undefined
                  }
                />
              </li>

              {openEnrollSelector && (
                <EnrollSelector
                  setEnrollText={setEnrollText}
                  setOpenEnrollSelector={setOpenEnrollSelector}
                  top={isMobile ? 29 : 24.5}
                />
              )}
            </ul>

            <div className={style.viewEmployeeLeadsResults}>
              <span className={style.viewEmployeeDataDivNameDivSpan}>
                {searchLeadsOutput?.length !== 1
                  ? searchLeadsOutput?.length + ' resultados'
                  : searchLeadsOutput?.length + ' resultado'}
              </span>

              <ul className={style.viewEmployeeLeadsResultsUl}>
                <li className={style.viewEmployeeLeadsResultsUlLi}>
                  <div
                    className={style.viewEmployeeLeadsResultsUlLiDivGreen}
                  ></div>

                  <span>Matriculado</span>
                </li>

                <li className={style.viewEmployeeLeadsResultsUlLi}>
                  <div
                    className={style.viewEmployeeLeadsResultsUlLiDivYellow}
                  ></div>

                  <span>Interessado</span>
                </li>

                <li className={style.viewEmployeeLeadsResultsUlLi}>
                  <div
                    className={style.viewEmployeeLeadsResultsUlLiDivRed}
                  ></div>

                  <span>Não matriculado</span>
                </li>
              </ul>
            </div>

            <ul className={style.viewEmployeeLeadsList}>
              {searchLeadsOutput?.map((lead) => (
                <li key={lead.id} className={style.viewEmployeeLeadsListLi}>
                  <h1 className={style.viewEmployeeLeadsListH1}>
                    {employeeNameEllipsis(lead.name)}
                  </h1>

                  <ul className={style.viewEmployeeLeadsListActions}>
                    <li className={style.viewEmployeeLeadsListActionsLi}>
                      <div
                        className={style.viewEmployeeLeadsListActionsEnroll}
                        style={
                          lead.enroll
                            ? { backgroundColor: '#9dcd5a' }
                            : lead.interest
                            ? { backgroundColor: '#ffff00' }
                            : { backgroundColor: '#e62331' }
                        }
                      ></div>
                    </li>

                    <li
                      className={style.viewEmployeeLeadsListActionsLi}
                      onClick={() => [
                        setCurrentLeadId(lead.id),
                        setOpenViewLead(true),
                      ]}
                    >
                      <FaRegEye className={style.funcionariosUlLiDivSvg} />
                    </li>

                    <li className={style.viewEmployeeLeadsListActionsLi}>
                      <FiEdit2
                        className={style.funcionariosUlLiDivSvg}
                        onClick={() => [
                          setCurrentLeadId(lead.id),
                          setOpenEditLead(true),
                        ]}
                      />
                    </li>

                    <li className={style.viewEmployeeLeadsListActionsLi}>
                      <RiDeleteBin7Line
                        className={style.funcionariosUlLiDivSvg}
                        onClick={() => [
                          setCurrentLeadId(lead.id),
                          setOpenDeleteLead(true),
                        ]}
                      />
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {openViewLead && (
          <ViewLead
            currentLeadId={currentLeadId}
            setOpenViewLead={setOpenViewLead}
          />
        )}

        {openEditLead && (
          <EditLead
            currentLeadId={currentLeadId}
            setOpenEditLead={setOpenEditLead}
            fetchLeads={fetchLeads}
          />
        )}

        {openDeleteLead && (
          <DeleteLead
            currentLeadId={currentLeadId}
            setOpenDeleteLead={setOpenDeleteLead}
            fetchLeads={fetchLeads}
          />
        )}
      </section>

      {showBlur && <div className={style.blur}></div>}
    </main>
  )
}
