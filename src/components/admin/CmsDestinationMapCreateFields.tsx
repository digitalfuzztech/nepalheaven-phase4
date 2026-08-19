const inputClass =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#0c1724] outline-none transition focus:border-gold";

export function CmsDestinationMapCreateFields() {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#0c1724]">
                Map Location
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
                Enter the geographic coordinates used to locate this destination on the public map.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                        Latitude
                    </span>

                    <input
                        type="number"
                        name="latitude"
                        min="-90"
                        max="90"
                        step="any"
                        placeholder="Example: 27.7172"
                        className={
                            inputClass
                        }
                    />

                    <span className="mt-2 block text-xs text-muted-foreground">
                        Valid range: -90 to 90
                    </span>
                </label>

                <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#0c1724]">
                        Longitude
                    </span>

                    <input
                        type="number"
                        name="longitude"
                        min="-180"
                        max="180"
                        step="any"
                        placeholder="Example: 85.3240"
                        className={
                            inputClass
                        }
                    />

                    <span className="mt-2 block text-xs text-muted-foreground">
                        Valid range: -180 to 180
                    </span>
                </label>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
                Either provide both Latitude and Longitude or leave both empty.
            </p>
        </section>
    );
}