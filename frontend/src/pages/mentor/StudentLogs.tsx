import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Topbar } from "../../ui/primitives/Topbar";
import { Card, Button, Loader, BackButton } from "../../ui";
import { getMentorStudentLogs } from "../../api/client";
import { StudentLog } from "../../api/types";
import { parseISO, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Tabbar } from "../../ui";

const actionLabel = (a: string) => {
  switch (a) {
    case "progress_open":
      return "Открыт раздел Прогресс";
    case "history_open":
      return "Открыта История дня";
    case "today_open":
      return "Открыта страница Сегодня";
    case "library_open":
      return "Открыта Библиотека";
    default:
      return a;
  }
};

const formatTs = (iso: string) => {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ru });
  } catch {
    return iso;
  }
};

const PAGE_SIZE = 50;

const MentorStudentLogs: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<StudentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = async (reset = false) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const resp = await getMentorStudentLogs(Number(id), {
        limit: PAGE_SIZE,
        offset: reset ? 0 : offset,
      });
      if (resp.ok) {
        const items = resp.logs || [];
        setHasMore(items.length === PAGE_SIZE);
        if (reset) {
          setLogs(items);
          setOffset(items.length);
        } else {
          setLogs((prev) => [...prev, ...items]);
          setOffset((prev) => prev + items.length);
        }
      }
    } catch (e) {
      console.error("Error loading logs", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div>
      <Topbar title="Журнал действий" leftSlot={<BackButton />} />
      <div style={{ padding: 16, display: "grid", gap: 16 }}>
        <Card>
          <h3 style={{ margin: 0, padding: "12px 12px 0" }}>События</h3>
          {isLoading && logs.length === 0 ? (
            <div style={{ padding: 16 }}>
              <Loader size="sm" message="Загрузка…" />
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 16 }}>Нет событий</div>
          ) : (
            <div>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "75px 1fr",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <div style={{ color: "#666", fontSize: 12 }}>
                    {formatTs(log.createdAt)}
                  </div>
                  <div>
                    <div style={{ marginBottom: 6 }}>
                      {actionLabel(log.action)}
                    </div>
                    {log.metadata ? (
                      <pre
                        style={{
                          margin: 0,
                          background: "#fafafa",
                          border: "1px solid #f0f0f0",
                          borderRadius: 6,
                          padding: 8,
                          fontSize: 12,
                          overflowX: "auto",
                        }}
                      >
                        {(() => {
                          try {
                            return JSON.stringify(log.metadata, null, 2);
                          } catch {
                            return String(log.metadata);
                          }
                        })()}
                      </pre>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <div style={{ padding: 12 }}>
              <Button disabled={isLoading} onClick={() => loadPage(false)}>
                {isLoading ? "Загрузка…" : "Загрузить ещё"}
              </Button>
            </div>
          )}
        </Card>
      </div>
      <Tabbar type="mentor" />
    </div>
  );
};

export default MentorStudentLogs;
