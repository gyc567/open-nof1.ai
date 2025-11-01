import { prisma } from "@/lib/prisma";
import { ModelType } from "@prisma/client";
import { NextResponse } from "next/server";
import { MetricData } from "@/lib/types/metrics";

// 最大返回数据点数量
const MAX_DATA_POINTS = 50;

/**
 * 从数组中均匀采样指定数量的元素
 * @param data - 原始数据数组
 * @param sampleSize - 需要采样的数量
 * @returns 均匀分布的采样数据
 */
function uniformSample<T>(data: T[], sampleSize: number): T[] {
  if (data.length <= sampleSize) {
    return data;
  }

  const result: T[] = [];
  const step = (data.length - 1) / (sampleSize - 1);

  for (let i = 0; i < sampleSize; i++) {
    const index = Math.round(i * step);
    result.push(data[index]);
  }

  return result;
}

export const GET = async () => {
  try {
    // Get all metrics records
    const allMetrics = await prisma.metrics.findMany({
      where: {
        model: ModelType.Deepseek,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!allMetrics || allMetrics.length === 0) {
      return NextResponse.json({
        data: {
          metrics: [],
          totalCount: 0,
        },
        success: true,
      });
    }

    // Transform metrics data
    const metricsData = allMetrics.map((metric) => {
      const metricData = metric.metrics as any;
      return {
        totalValue: metricData.totalValue || 0,
        unrealizedPnl: metricData.unrealizedPnl || 0,
        availableBalance: metricData.availableBalance || 0,
        availableCash: metricData.availableBalance || 0,
        currentTotalReturn: ((metricData.totalValue || 30000) - 30000) / 30000,
        positions: metricData.positions || [],
        createdAt: metric.createdAt.toISOString(),
      };
    });

    // 均匀采样数据，最多返回 MAX_DATA_POINTS 条
    const sampledMetrics = uniformSample(metricsData, MAX_DATA_POINTS);

    console.log(
      `📊 Total metrics: ${metricsData.length}, Sampled: ${sampledMetrics.length}`
    );

    return NextResponse.json({
      data: {
        metrics: sampledMetrics,
        totalCount: metricsData.length,
        model: allMetrics[0]?.model || ModelType.Deepseek,
        name: allMetrics[0]?.name || "Deepseek Trading Bot",
        createdAt: allMetrics[0]?.createdAt || new Date().toISOString(),
        updatedAt: allMetrics[0]?.updatedAt || new Date().toISOString(),
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({
      data: {
        metrics: [],
        totalCount: 0,
        model: ModelType.Deepseek,
        name: "Deepseek Trading Bot",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      success: true,
    });
  }
};
