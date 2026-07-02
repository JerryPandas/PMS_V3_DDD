import { useEffect, useState } from 'react'
import { Box, Grid, Paper, Typography, Skeleton } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { getDashboardSummary } from '../api/dashboard'

const STATUS_LABELS = {
  Planning: 'Planning', InProgress: 'In Progress', OnHold: 'On Hold', Completed: 'Completed', Cancelled: 'Cancelled'
}
const STATUS_COLORS = ['#0B1F3A', '#C9A227', '#5B6472', '#2E7D5B', '#B3432B']

function StatCard({ label, value }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{value}</Typography>
    </Paper>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getDashboardSummary().then(setData).catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <Grid container spacing={2.5}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={100} /></Grid>
        ))}
      </Grid>
    )
  }

  const pieData = data.projectStatusDistribution.map((s, i) => ({
    id: s.status, value: s.count, label: STATUS_LABELS[s.status] || s.status, color: STATUS_COLORS[i % STATUS_COLORS.length]
  }))

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Projects" value={data.totalProjects} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Active Projects" value={data.activeProjects} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Personnel" value={data.totalPeople} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Cards" value={data.totalCards} /></Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: 360 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Project Status Distribution</Typography>
            {pieData.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 4 }}>No project data</Typography>
            ) : (
              <PieChart
                series={[{ data: pieData, innerRadius: 50, outerRadius: 120, paddingAngle: 2, cornerRadius: 4 }]}
                height={280}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, height: 360 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Personnel Workload</Typography>
            {data.workloads.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 4 }}>No kanban task data</Typography>
            ) : (
              <BarChart
                height={280}
                dataset={data.workloads}
                xAxis={[{ scaleType: 'band', dataKey: 'personName' }]}
                series={[
                  { dataKey: 'totalCards', label: 'Total Tasks', color: '#14335C' },
                  { dataKey: 'doneCards', label: 'Completed', color: '#C9A227' }
                ]}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2.5, height: 340 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Last 6 Months Trend</Typography>
            <LineChart
              height={260}
              dataset={data.monthlyTrends}
              xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
              series={[
                { dataKey: 'newItems', label: 'New Items', color: '#0B1F3A', curve: 'monotoneX' },
                { dataKey: 'completedItems', label: 'Completed Items', color: '#C9A227', curve: 'monotoneX' }
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
